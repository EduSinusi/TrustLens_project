from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, File
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
from firebase_admin import credentials, firestore
import os
from url_processing.url_processor import process_and_block_url
from real_time_url_extractor import extract_url_from_qr_code, extract_url_from_text, preprocess_image
from url_processing.virustotal import get_virustotal_full_result, check_virustotal

# Global variables
webcam_running = False
scanning_active = False
current_frame = None
latest_url = None
latest_safety_status = None
latest_block_status = None
webcam_error = None
current_camera_index = 0
webcam_thread = None
limiter = Limiter(key_func=get_remote_address)

def create_error_frame(message):
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(frame, message, (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return frame

def initialize_webcam(camera_index, max_retries=3):
    for attempt in range(max_retries):
        cap = cv2.VideoCapture(camera_index, cv2.CAP_MSMF)
        if cap.isOpened():
            print(f"Webcam opened with MSMF at index {camera_index}")
            return cap
        cap.release()
        cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        if cap.isOpened():
            print(f"Webcam opened with DirectShow at index {camera_index}")
            return cap
        cap.release()
        time.sleep(1)
    return None

def generate_frames(camera_index=0):
    global current_frame, webcam_running, scanning_active, latest_url, latest_safety_status, latest_block_status, webcam_error
    cap = initialize_webcam(camera_index)
    if not cap and camera_index == 0:
        print("Laptop webcam (index 0) not available, falling back to external webcam (index 1)")
        cap = initialize_webcam(1)
        if cap:
            global current_camera_index
            current_camera_index = 1

    if not cap:
        webcam_error = "No webcam available"
        current_frame = create_error_frame(webcam_error)
        webcam_running = False
        return

    webcam_running = True
    try:
        while webcam_running:
            ret, frame = cap.read()
            if not ret:
                webcam_error = f"Failed to capture frame from webcam {camera_index}"
                current_frame = create_error_frame(webcam_error)
                break

            if scanning_active:
                latest_url = None
                latest_safety_status = None
                latest_block_status = None
                
                url = extract_url_from_qr_code(frame)
                if url:
                    print(f"QR Code detected: {url}")
                    latest_url = url
                    latest_safety_status, latest_block_status = process_and_block_url(url)
                    print(f"Processed URL: {url} - Safety: {latest_safety_status}, Block Status: {latest_block_status}")
                    scanning_active = False
                    cv2.putText(frame, f"URL: {url}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                else:
                    processed_frame = preprocess_image(frame)
                    url = extract_url_from_qr_code(processed_frame)
                    if url:
                        print(f"QR Code detected (preprocessed): {url}")
                        latest_url = url
                        latest_safety_status, latest_block_status = process_and_block_url(url)
                        print(f"Processed URL: {url} - Safety: {latest_safety_status}, Block Status: {latest_block_status}")
                        scanning_active = False
                        cv2.putText(frame, f"URL: {url}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    else:
                        url = extract_url_from_text(processed_frame)
                        if url:
                            print(f"Text URL detected: {url}")
                            latest_url = url
                            latest_safety_status, latest_block_status = process_and_block_url(url)
                            print(f"Processed URL: {url} - Safety: {latest_safety_status}, Block Status: {latest_block_status}")
                            scanning_active = False
                            cv2.putText(frame, f"URL: {url}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                        else:
                            print("No QR code or URL detected in this frame")

            current_frame = frame.copy()
            webcam_error = None
            cv2.waitKey(50)
    finally:
        cap.release()
        webcam_running = False
        scanning_active = False  # Reset scanning_active when webcam stops
        print("Webcam released")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global webcam_thread, scanning_active
    scanning_active = False  # Ensure scanning is off on startup
    webcam_thread = Thread(target=generate_frames, args=(current_camera_index,))
    webcam_thread.start()
    print("Webcam thread started on startup")
    yield
    global webcam_running
    webcam_running = False
    scanning_active = False  # Reset scanning_active on shutdown
    if webcam_thread:
        webcam_thread.join()
        print("Webcam thread stopped on shutdown")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        raise HTTPException(status_code=400, detail="Invalid camera index. Use 0 or 1.")
    webcam_running = False
    scanning_active = False  # Reset scanning_active when switching cameras
    if webcam_thread:
        webcam_thread.join()
    current_camera_index = camera_index
    webcam_thread = Thread(target=generate_frames, args=(camera_index,))
    webcam_thread.start()
    camera_name = "laptop webcam" if camera_index == 0 else "external webcam"
    return {"message": f"Switched to {camera_name}"}

@app.get("/stop_webcam")
async def stop_webcam():
    global webcam_running, webcam_thread, latest_url, latest_safety_status, latest_block_status, scanning_active
    if not webcam_running:
        return {"message": "Webcam is already stopped"}
    webcam_running = False
    scanning_active = False  # Reset scanning_active when stopping webcam
    if webcam_thread:
        webcam_thread.join()
        webcam_thread = None
    latest_url = None
    latest_safety_status = None
    latest_block_status = None
    return {"message": "Webcam stopped successfully and scan results cleared"}

@app.get("/start_webcam")
async def start_webcam():
    global webcam_running, webcam_thread, current_camera_index, scanning_active
    if webcam_running:
        return {"message": "Webcam is already running"}
    scanning_active = False  # Ensure scanning is off when starting webcam
    webcam_thread = Thread(target=generate_frames, args=(current_camera_index,))
    webcam_thread.start()
    return {"message": "Webcam started successfully"}

@app.get("/start_scan")
async def start_scan():
    global scanning_active, latest_url, latest_safety_status, latest_block_status
    if not webcam_running:
        raise HTTPException(status_code=400, detail="Webcam is not running")
    latest_url = None
    latest_safety_status = None
    latest_block_status = None
    scanning_active = True
    return {"message": "Scanning started"}

@app.get("/stop_scan")
async def stop_scan():
    global scanning_active
    scanning_active = False
    return {"message": "Scanning stopped"}

@app.get("/get_url")
async def get_url():
    global latest_url, latest_safety_status, latest_block_status
    if latest_url and latest_safety_status:
        return {
            "url": latest_url,
            "safety_status": latest_safety_status,
            "block_status": latest_block_status
        }
    return {
        "url": "",
        "safety_status": {"overall": "No URL detected yet", "details": {}},
        "block_status": None
    }

@app.get("/get_webcam_status")
async def get_webcam_status():
    global webcam_error
    return {"error": webcam_error if webcam_error else ""}

@app.post("/scan_url")
@limiter.limit("10/minute")  # Limit to 10 requests per minute per IP
async def scan_url(request: Request):
    data = await request.json()
    if not data or 'url' not in data:
        raise HTTPException(status_code=400, detail="No URL provided")
    url = data['url']
    try:
        safety_status, block_status = process_and_block_url(url)
        if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
            safety_status = {
                "overall": "Error",
                "details": {"general": safety_status if isinstance(safety_status, str) else "Unknown error"}
            }
        print(f"Scan URL Response: {url} - Safety: {safety_status}, Block Status: {block_status}")
        return {
            "url": url,
            "safety_status": safety_status,
            "block_status": block_status
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
        print(f"Scan URL Error: {error_response}")
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
@limiter.limit("5/minute")  # Limit to 5 requests per minute per IP
async def get_virustotal_full_result_endpoint(request: Request):
    # Extract URL from request
    if request.method == "GET":
        url = request.query_params.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="No URL provided in query parameters")
    else:  # POST
        data = await request.json()
        if not data or 'url' not in data:
            raise HTTPException(status_code=400, detail="No URL provided in request body")
        url = data['url']

    try:
        # Step 1: Try to get the result from the in-memory cache
        full_result = get_virustotal_full_result(url)
        if "error" not in full_result:
            print(f"Retrieved full VirusTotal result from cache for {url}")
            return {"result": full_result}

        # Step 2: If not in cache, try to retrieve from Firestore
        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc = query[0].to_dict()
            safety_status = doc.get("safety_status", {})
            virustotal_result = safety_status.get("details", {}).get("virustotal", {})
            if virustotal_result and "stats" in virustotal_result:
                print(f"Retrieved full VirusTotal result from Firestore for {url}")
                return {"result": virustotal_result}

        # Step 3: If not in Firestore, re-scan the URL
        print(f"Full VirusTotal result not found for {url}. Re-scanning...")
        scan_result = check_virustotal(url)

        # Step 4: Get the full result after re-scanning
        full_result = get_virustotal_full_result(url)
        if "error" in full_result:
            raise HTTPException(status_code=404, detail="Failed to retrieve result after re-scanning")

        # Step 5: Update Firestore with the new full result
        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc_ref = query[0].reference
            doc_data = query[0].to_dict()
            safety_status = doc_data.get("safety_status", {"overall": "Unknown", "details": {}})
            safety_status["details"]["virustotal"] = full_result
            doc_ref.update({"safety_status": safety_status})
            print(f"Updated Firestore with new VirusTotal result for {url}")
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
            print(f"Stored new VirusTotal result in Firestore for {url}")

        return {"result": full_result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch full VirusTotal result: {str(e)}")

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.post("/scan_image")
async def scan_image(file: UploadFile = File(...)):
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())
    try:
        image = cv2.imread(filepath)
        if image is None:
            raise HTTPException(status_code=400, detail="Failed to read the image")
        processed_image = preprocess_image(image)
        url = extract_url_from_qr_code(processed_image)
        if not url:
            url = extract_url_from_text(processed_image)
        if not url:
            return {
                "url": "",
                "safety_status": {"overall": "No URL detected in the image", "details": {}},
                "block_status": None
            }
        safety_status, block_status = process_and_block_url(url)
        if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
            safety_status = {
                "overall": "Error",
                "details": {"general": safety_status if isinstance(safety_status, str) else "Unknown error"}
            }
        print(f"Scan Image Response: {url} - Safety: {safety_status}, Block Status: {block_status}")
        return {
            "url": url,
            "safety_status": safety_status,
            "block_status": block_status
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
        print(f"Scan Image Error: {error_response}")
        return error_response
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)