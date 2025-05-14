# app.py
from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import cv2
from pydantic import BaseModel
import numpy as np
import time
from threading import Thread
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from url_processing.url_processor import process_and_block_url
from real_time_url_extractor import extract_url_from_qr_code, extract_url_from_text, preprocess_image
from url_processing.virustotal import get_virustotal_full_result, check_virustotal
import google.cloud.logging
from google.cloud.logging_v2.handlers import CloudLoggingHandler
import logging
import requests

# Initialize Google Cloud Logging
client = google.cloud.logging.Client.from_service_account_json(
    r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
)
logger = client.logger("app")

# Global variables
webcam_running = False
scanning_active = False
evaluating_url = False
current_frame = None
latest_url = None
latest_safety_status = None
latest_block_status = None
latest_gemini_summary = None  # Added to store Gemini summary
webcam_error = None
current_camera_index = 0
webcam_thread = None
current_user_uid = None
limiter = Limiter(key_func=get_remote_address)

def create_error_frame(message):
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(frame, message, (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return frame

def initialize_webcam(camera_index, max_retries=3):
    for attempt in range(max_retries):
        cap = cv2.VideoCapture(camera_index, cv2.CAP_MSMF)
        if cap.isOpened():
            logger.log_text(f"Webcam opened with MSMF at index {camera_index}", severity="INFO")
            return cap
        cap.release()
        cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        if cap.isOpened():
            logger.log_text(f"Webcam opened with DirectShow at index {camera_index}", severity="INFO")
            return cap
        cap.release()
        time.sleep(1)
    logger.log_text(f"Failed to initialize webcam at index {camera_index} after {max_retries} attempts", severity="ERROR")
    return None

def generate_frames(camera_index=0):
    global current_frame, webcam_running, scanning_active, latest_url, latest_safety_status, latest_block_status, latest_gemini_summary, webcam_error, evaluating_url, current_user_uid
    cap = initialize_webcam(camera_index)
    if not cap:
        webcam_error = "No webcam available"
        current_frame = create_error_frame(webcam_error)
        webcam_running = False
        logger.log_text("No webcam available", severity="ERROR")
        return

    webcam_running = True
    try:
        while webcam_running:
            ret, frame = cap.read()
            if not ret:
                webcam_error = f"Failed to capture frame from webcam {camera_index}"
                current_frame = create_error_frame(webcam_error)
                logger.log_text(webcam_error, severity="ERROR")
                break

            if scanning_active:
                latest_url = None
                latest_safety_status = None
                latest_block_status = None
                latest_gemini_summary = None  # Reset Gemini summary
                
                url = extract_url_from_qr_code(frame)
                if not url:
                    processed_frame = preprocess_image(frame)
                    url = extract_url_from_qr_code(processed_frame) or extract_url_from_text(processed_frame)

                if url:
                    logger.log_text(f"URL detected: {url}", severity="INFO")
                    latest_url = url
                    evaluating_url = True
                    # Unpack all three values returned by process_and_block_url
                    latest_safety_status, latest_block_status, latest_gemini_summary = process_and_block_url(url, user_uid=current_user_uid)
                    evaluating_url = False
                    scanning_active = False
                    cv2.putText(frame, f"URL: {url}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            current_frame = frame.copy()
            webcam_error = None
            cv2.waitKey(50)
    finally:
        cap.release()
        webcam_running = False
        scanning_active = False
        evaluating_url = False
        current_user_uid = None
        logger.log_text("Webcam released", severity="INFO")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global webcam_thread, scanning_active
    scanning_active = False
    webcam_thread = Thread(target=generate_frames, args=(current_camera_index,))
    webcam_thread.start()
    logger.log_text("Webcam thread started on startup", severity="INFO")
    yield
    global webcam_running
    webcam_running = False
    scanning_active = False
    if webcam_thread:
        webcam_thread.join()
        logger.log_text("Webcam thread stopped on shutdown", severity="INFO")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to verify Firebase ID token
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        logger.log_struct({
            "message": "Invalid or expired token",
            "error": str(e)
        }, severity="ERROR")
        return None

@app.get("/video_feed/{camera_index}")
async def video_feed(camera_index: int):
    def gen():
        global current_frame
        while webcam_running or current_frame is not None:
            if current_frame is not None:
                ret, jpeg = cv2.imencode('.jpg', current_frame)
                frame = jpeg.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
            time.sleep(0.1)
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/switch_camera/{camera_index}")
async def switch_camera(camera_index: int):
    global webcam_running, webcam_thread, current_camera_index, scanning_active
    if camera_index not in [0, 1]:
        logger.log_text(f"Invalid camera index: {camera_index}", severity="ERROR")
        raise HTTPException(status_code=400, detail="Invalid camera index. Use 0 or 1.")
    webcam_running = False
    scanning_active = False
    if webcam_thread:
        webcam_thread.join()
    current_camera_index = camera_index
    webcam_thread = Thread(target=generate_frames, args=(camera_index,))
    webcam_thread.start()
    camera_name = "laptop webcam" if camera_index == 0 else "external webcam"
    logger.log_text(f"Switched to {camera_name}", severity="INFO")
    return {"message": f"Switched to {camera_name}"}

@app.get("/stop_webcam")
async def stop_webcam():
    global webcam_running, webcam_thread, latest_url, latest_safety_status, latest_block_status, latest_gemini_summary, scanning_active, current_user_uid
    if not webcam_running:
        logger.log_text("Webcam is already stopped", severity="INFO")
        return {"message": "Webcam is already stopped"}
    webcam_running = False
    scanning_active = False
    if webcam_thread:
        webcam_thread.join()
        webcam_thread = None
    latest_url = None
    latest_safety_status = None
    latest_block_status = None
    latest_gemini_summary = None  # Reset Gemini summary
    current_user_uid = None
    logger.log_text("Webcam stopped successfully and scan results cleared", severity="INFO")
    return {"message": "Webcam stopped successfully and scan results cleared"}

@app.get("/start_webcam")
async def start_webcam():
    global webcam_running, webcam_thread, current_camera_index, scanning_active
    if webcam_running:
        logger.log_text("Webcam is already running", severity="INFO")
        return {"message": "Webcam is already running"}
    scanning_active = False
    webcam_thread = Thread(target=generate_frames, args=(current_camera_index,))
    webcam_thread.start()
    logger.log_text("Webcam started successfully", severity="INFO")
    return {"message": "Webcam started successfully"}

@app.get("/start_scan")
async def start_scan(user_uid: str = Depends(get_current_user)):
    global scanning_active, latest_url, latest_safety_status, latest_block_status, latest_gemini_summary, current_user_uid
    if not webcam_running:
        logger.log_text("Attempted to start scan but webcam is not running", severity="ERROR")
        raise HTTPException(status_code=400, detail="Webcam is not running")
    latest_url = None
    latest_safety_status = None
    latest_block_status = None
    latest_gemini_summary = None  # Reset Gemini summary
    scanning_active = True
    current_user_uid = user_uid
    logger.log_text(f"Scanning started for user_uid: {user_uid}", severity="INFO")
    return {"message": "Scanning started"}

@app.get("/stop_scan")
async def stop_scan():
    global scanning_active, current_user_uid
    scanning_active = False
    current_user_uid = None
    logger.log_text("Scanning stopped", severity="INFO")
    return {"message": "Scanning stopped"}

@app.get("/get_url")
async def get_url(user_uid: str = Depends(get_current_user)):
    global latest_url, latest_safety_status, latest_block_status, latest_gemini_summary
    if latest_url and latest_safety_status:
        logger.log_text(f"Returning URL info: {latest_url}", severity="INFO")
        return {
            "url": latest_url,
            "safety_status": latest_safety_status,
            "block_status": latest_block_status,
            "gemini_summary": latest_gemini_summary,  # Include Gemini summary
            "evaluating": evaluating_url
        }
    logger.log_text("No URL detected yet", severity="INFO")
    return {
        "url": "",
        "safety_status": {"overall": "No URL detected yet", "details": {}},
        "block_status": None,
        "gemini_summary": "No summary available",  # Default value
        "evaluating": evaluating_url
    }

@app.get("/get_webcam_status")
async def get_webcam_status():
    global webcam_error
    logger.log_text(f"Webcam status check: {webcam_error if webcam_error else 'No error'}", severity="INFO")
    return {"error": webcam_error if webcam_error else ""}

@app.post("/scan_url")
@limiter.limit("10/minute")
async def scan_url(request: Request, user_uid: str = Depends(get_current_user)):
    data = await request.json()
    if not data or 'url' not in data:
        logger.log_text("No URL provided in scan_url request", severity="ERROR")
        raise HTTPException(status_code=400, detail="No URL provided")
    url = data['url']
    try:
        safety_status, block_status, gemini_summary = process_and_block_url(url, user_uid=user_uid)
        if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
            safety_status = {
                "overall": "Error",
                "details": {"general": safety_status if isinstance(safety_status, str) else "Unknown error"}
            }
        logger.log_struct({
            "message": "Scan URL completed",
            "url": url,
            "user_uid": user_uid,
            "safety_status": safety_status,
            "block_status": block_status,
            "gemini_summary": gemini_summary
        }, severity="INFO")
        return {
            "url": url,
            "safety_status": safety_status,
            "block_status": block_status,
            "gemini_summary": gemini_summary
        }
    except Exception as e:
        error_response = {
            "url": url,
            "safety_status": {
                "overall": "Error",
                "details": {"general": f"Failed to process URL: {str(e)}"}
            },
            "block_status": None
        }
        logger.log_struct({
            "message": "Scan URL failed",
            "url": url,
            "user_uid": user_uid,
            "error": str(e)
        }, severity="ERROR")
        return error_response

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(
        r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\trustlens-cbf72-firebase-adminsdk-fbsvc-b5be2f6954.json"
    )
    firebase_admin.initialize_app(cred)

# Initialize Firestore client and collections
db = firestore.client()
urls_collection = db.collection('Scanned URLs')

@app.api_route("/get_virustotal_full_result", methods=["GET", "POST"])
@limiter.limit("5/minute")
async def get_virustotal_full_result_endpoint(request: Request):
    if request.method == "GET":
        url = request.query_params.get("url")
        if not url:
            logger.log_text("No URL provided in query parameters", severity="ERROR")
            raise HTTPException(status_code=400, detail="No URL provided in query parameters")
    else:
        data = await request.json()
        if not data or 'url' not in data:
            logger.log_text("No URL provided in request body", severity="ERROR")
            raise HTTPException(status_code=400, detail="No URL provided in request body")
        url = data['url']

    try:
        full_result = get_virustotal_full_result(url)
        if "error" not in full_result:
            logger.log_text(f"Retrieved full VirusTotal result from cache for {url}", severity="INFO")
            return {"result": full_result}

        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc = query[0].to_dict()
            safety_status = doc.get("safety_status", {})
            virustotal_result = safety_status.get("details", {}).get("virustotal", {})
            if virustotal_result and "stats" in virustotal_result:
                logger.log_text(f"Retrieved full VirusTotal result from Firestore for {url}", severity="INFO")
                return {"result": virustotal_result}

        logger.log_text(f"Full VirusTotal result not found for {url}. Re-scanning...", severity="INFO")
        scan_result = check_virustotal(url)

        full_result = get_virustotal_full_result(url)
        if "error" in full_result:
            logger.log_text(f"Failed to retrieve result after re-scanning for {url}", severity="ERROR")
            raise HTTPException(status_code=404, detail="Failed to retrieve result after re-scanning")

        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc_ref = query[0].reference
            doc_data = query[0].to_dict()
            safety_status = doc_data.get("safety_status", {"overall": "Unknown", "details": {}})
            safety_status["details"]["virustotal"] = full_result
            doc_ref.update({"safety_status": safety_status})
            logger.log_text(f"Updated Firestore with new VirusTotal result for {url}", severity="INFO")
        else:
            safety_status = {
                "overall": "Unknown",
                "details": {"virustotal": full_result}
            }
            urls_collection.add({
                "url": url,
                "safety_status": safety_status,
                "timestamp": firestore.SERVER_TIMESTAMP
            })
            logger.log_text(f"Stored new VirusTotal result in Firestore for {url}", severity="INFO")

        return {"result": full_result}

    except Exception as e:
        logger.log_struct({
            "message": "Failed to fetch full VirusTotal result",
            "url": url,
            "error": str(e)
        }, severity="ERROR")
        raise HTTPException(status_code=500, detail=f"Failed to fetch full VirusTotal result: {str(e)}")
    
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.post("/scan_image")
async def scan_image(file: UploadFile = File(...), user_uid: str = Depends(get_current_user)):
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())
    try:
        image = cv2.imread(filepath)
        if image is None:
            logger.log_text(f"Failed to read image: {file.filename}", severity="ERROR")
            raise HTTPException(status_code=400, detail="Failed to read the image")
        processed_image = preprocess_image(image)
        url = extract_url_from_qr_code(processed_image)
        if not url:
            url = extract_url_from_text(processed_image)
        if not url:
            logger.log_text(f"No URL detected in image: {file.filename}", severity="INFO")
            return {
                "url": "",
                "safety_status": {"overall": "No URL detected in the image", "details": {}},
                "block_status": None
            }
        safety_status, block_status, gemini_summary = process_and_block_url(url, user_uid=user_uid)
        if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
            safety_status = {
                "overall": "Error",
                "details": {"general": safety_status if isinstance(safety_status, str) else "Unknown error"}
            }
        logger.log_struct({
            "message": "Scan Image completed",
            "url": url,
            "user_uid": user_uid,
            "safety_status": safety_status,
            "block_status": block_status,
            "gemini_summary": gemini_summary
        }, severity="INFO")
        return {
            "url": url,
            "safety_status": safety_status,
            "block_status": block_status,
            "gemini_summary": gemini_summary
        }
    except Exception as e:
        error_response = {
            "url": "",
            "safety_status": {
                "overall": "Error",
                "details": {"general": f"Error processing image: {str(e)}"}
            },
            "block_status": None
        }
        logger.log_struct({
            "message": "Scan Image failed",
            "error": str(e),
            "filename": file.filename,
            "user_uid": user_uid
        }, severity="ERROR")
        return error_response
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)