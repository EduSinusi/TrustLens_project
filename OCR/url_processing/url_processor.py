import firebase_admin
from firebase_admin import credentials, firestore
from .virustotal import check_virustotal, get_virustotal_full_result
from .domaincheck import check_domain_security
from website_blocker import block_unsafe_website
import time
import google.cloud.logging
import requests
import uuid

# Initialize Google Cloud Logging
client = google.cloud.logging.Client.from_service_account_json(
    r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"  # Adjust to your path
)
logger = client.logger("url_processor")

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(
        r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\trustlens-cbf72-firebase-adminsdk-fbsvc-b5be2f6954.json"  # Adjust to your path
    )
    firebase_admin.initialize_app(cred)

db = firestore.client()
urls_collection = db.collection('Scanned URLs')
blocked_websites_collection = db.collection('Blocked Websites')  # Define the blocked websites collection

def get_url_doc_id(url: str) -> str:
    """Generate a deterministic document ID from the URL using SHA-256."""
    return hashlib.sha256(url.encode('utf-8')).hexdigest()

def get_gemini_summary(safety_status: dict) -> str:
    """
    Calls the gemini_analysis.py endpoint to generate an AI summary of the safety status.
    Returns the summary as a string, or an error message if the call fails.
    """
    try:
        response = requests.post(
            "http://localhost:5001/gemini/summarize",
            json={"domain_security_result": safety_status},
            timeout=30  # Increased timeout
        )
        response.raise_for_status()  # Raise an exception for bad status codes

        gemini_result = response.json()
        if gemini_result.get("status") != "success":
            error_message = gemini_result.get("message", "Unknown error in Gemini API")
            logger.log_struct({
                "message": "Gemini summary failed",
                "safety_status": safety_status,
                "error": error_message
            }, severity="ERROR")
            return f"Error generating summary: {error_message}"

        summary = gemini_result["summary"]
        logger.log_struct({
            "message": "Gemini summary retrieved successfully",
            "safety_status": safety_status,
            "summary": summary
        }, severity="INFO")
        return summary
    except requests.exceptions.RequestException as e:
        logger.log_struct({
            "message": "Failed to reach Gemini summary server",
            "safety_status": safety_status,
            "error": str(e)
        }, severity="ERROR")
        return f"Error reaching Gemini server: {str(e)}"
    except Exception as e:
        logger.log_struct({
            "message": "Failed to generate Gemini summary",
            "safety_status": safety_status,
            "error": str(e)
        }, severity="ERROR")
        return f"Error generating summary: {str(e)}"

def check_url_in_firestore(url: str) -> tuple[dict, bool, str]:
    if not url:
        logger.log_text("No URL provided to check in Firestore", severity="ERROR")
        return {"overall": "Error", "details": {"general": "No URL to check"}}, False, "Error: No URL to check"

    try:
        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc = query[0].to_dict()
            safety_status = doc.get("safety_status", {"overall": "Unknown", "details": {}})
            gemini_summary = doc.get("gemini_summary", "No summary available")
            logger.log_struct({
                "message": "Found URL in Firestore",
                "url": url,
                "safety_status": safety_status,
                "gemini_summary": gemini_summary
            }, severity="INFO")
            
            details = safety_status.get("details", {})
            required_apis = {"virustotal", "url_info"}
            has_all_data = all(api in details and details[api] for api in required_apis)
            
            if has_all_data and gemini_summary != "No summary available":
                return safety_status, True, gemini_summary
            else:
                logger.log_text(f"URL {url} found but missing some API data or Gemini summary, proceeding to full evaluation", severity="INFO")
                return None, False, "Missing data or summary"
        logger.log_text(f"URL {url} not found in Firestore, proceeding to evaluate", severity="INFO")
        return None, False, "Not found in Firestore"
    except Exception as e:
        logger.log_struct({
            "message": "Firestore error",
            "url": url,
            "error": str(e)
        }, severity="ERROR")
        return {"overall": "Error", "details": {"general": f"Firestore error: {str(e)}"}}, False, f"Firestore error: {str(e)}"

def evaluate_url(url: str) -> tuple[dict, str]:
    logger.log_text(f"Evaluating URL: {url}", severity="INFO")
    
    domain_sec_result = check_domain_security(url)

    if domain_sec_result["status"] == "Non-existent":
        logger.log_text(f"Domain {url} is non-existent, skipping VirusTotal scan", severity="INFO")
        safety_status = {
            "overall": "URL does not exist",
            "details": {
                "url_info": domain_sec_result
            }
        }
        gemini_summary = get_gemini_summary(safety_status)
        return safety_status, gemini_summary

    virustotal_result = check_virustotal(url)
    virustotal_full_result = get_virustotal_full_result(url)

    if "error" in virustotal_full_result:
        virustotal_full_result = {
            "status": virustotal_result["status"],
            "message": virustotal_result["message"],
            "stats": {"malicious": 0, "suspicious": 0, "undetected": 0, "harmless": 0, "timeout": 0},
            "scan_results": {}
        }

    results = {
        "virustotal": virustotal_full_result,
        "url_info": domain_sec_result
    }
    
    logger.log_struct({
        "message": "Evaluation results",
        "url": url,
        "results": results
    }, severity="INFO")

    url_info_status = domain_sec_result["status"]
    if url_info_status == "Unknown":
        overall = "Unknown"
        message = "Domain status is inconclusive from TrustLens Domain Security Check"
        safety_status = {
            "overall": overall,
            "message": message,
            "details": results
        }
        gemini_summary = get_gemini_summary(safety_status)
        logger.log_struct({
            "message": "Evaluated safety status",
            "url": url,
            "safety_status": safety_status,
            "gemini_summary": gemini_summary
        }, severity="INFO")
        return safety_status, gemini_summary

    virustotal_status = virustotal_full_result["status"]
    url_info_security_score = domain_sec_result["details"]["security_score"]

    # Rule-based decision making
    if virustotal_status == "Unsafe" and url_info_status == "Unsafe":
        overall = "Unsafe"
        message = "Detected as unsafe by VirusTotal or TrustLens Domain Security Check"
    elif virustotal_status == "Safe" and url_info_status == "Unsafe":
        overall = "Unsafe"
        message = "TrustLens Domain Security Check detected as unsafe but VirusTotal indicates safe"
    elif virustotal_status == "Unsafe" and url_info_status == "Safe":
        overall = "Unsafe"
        message = "VirusTotal detected as unsafe but TrustLens Domain Security Check indicates as safe"
    elif virustotal_status == "Safe" and url_info_status == "Safe":
        overall = "Safe"
        message = "Both VirusTotal and TrustLens Domain Security Check indicate the URL is safe"
    elif virustotal_status == "Potentially Unsafe" and url_info_status == "Safe":
        overall = "Potentially Unsafe"
        message = "VirusTotal found suspicious detections, but TrustLens indicates safe"
    elif virustotal_status == "Safe" and url_info_status == "Potentially Unsafe":
        overall = "Safe"
        message = "VirusTotal indicates safe, but TrustLens Domain Security Check found potential risks"
    elif virustotal_status == "Unsafe" and url_info_status == "Potentially Unsafe":
        overall = "Unsafe"
        message = "Detected as unsafe by VirusTotal, and TrustLens Domain Security Check also found potential risks"
    elif virustotal_status == "Potentially Unsafe" and url_info_status == "Potentially Unsafe":
        overall = "Potentially Unsafe"
        message = "Both VirusTotal and TrustLens Domain Security Check found potential risks"
    elif virustotal_status == "Potentially Unsafe" and url_info_status == "Unsafe":
        overall = "Unsafe"
        message = "VirusTotal found suspicious detections, and TrustLens indicates unsafe"
    elif virustotal_status == "Unknown" and url_info_status == "Safe":
        overall = "Unknown"
        message = "VirusTotal is inconclusive, but TrustLens Domain Security Check indicates the URL is safe"
    elif virustotal_status == "Unknown" and url_info_status == "Potentially Unsafe":
        overall = "Unknown"
        message = "VirusTotal is inconclusive, and TrustLens Domain Security Check found potential risks"
    elif virustotal_status == "Safe" and url_info_status == "Unknown":
        overall = "Unknown"
        message = "TrustLens Domain Security Check is inconclusive, but VirusTotal indicates the URL is safe"
    elif virustotal_status == "Unknown" and url_info_status == "Unknown":
        overall = "Unknown"
        message = "Both VirusTotal and TrustLens Domain Security Check are inconclusive"
    elif virustotal_status == "Potentially Unsafe" and url_info_status == "Unknown":
        overall = "Unknown"
        message = "VirusTotal found suspicious detections, but TrustLens is inconclusive"
    else:
        overall = "Potentially Unsafe"
        message = "Mixed signals from VirusTotal and TrustLens Domain Security Check"

    safety_status = {
        "overall": overall,
        "message": message,
        "details": results
    }
    gemini_summary = get_gemini_summary(safety_status)
    logger.log_struct({
        "message": "Evaluated safety status",
        "url": url,
        "safety_status": safety_status,
        "gemini_summary": gemini_summary
    }, severity="INFO")
    return safety_status, gemini_summary

def store_url_in_firestore(url: str, safety_status: dict, gemini_summary: str, user_uid: str = None):
    if not url:
        logger.log_text("No URL provided to store in Firestore", severity="ERROR")
        return
    
    request_id = str(uuid.uuid4())
    logger.log_text(f"Storing URL: {url} for user_uid: {user_uid}, request_id: {request_id}", severity="DEBUG")
    
    if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
        safety_status = {
            "overall": "Error",
            "details": {"general": safety_status if isinstance(safety_status, str) else "Invalid safety status format"}
        }
        gemini_summary = "Error: Invalid safety status format"
    
    # Determine if the URL is unsafe
    is_unsafe = safety_status.get("overall") == "Unsafe"
    
    # Prepare data for global Scanned URLs (without blocked field)
    global_data = {
        "url": url,
        "safety_status": safety_status,
        "gemini_summary": gemini_summary,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    
    # Prepare data for user-specific scanned_urls
    user_data = {
        "url": url,
        "safety_status": safety_status,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "blocked": is_unsafe  # Only store blocked field in user-specific collection
    }
    
    # Create a log-safe copy of data without SERVER_TIMESTAMP
    log_global_data = {
        "url": url,
        "safety_status": safety_status,
        "timestamp": "SERVER_TIMESTAMP"
    }
    log_user_data = {
        "url": url,
        "safety_status": safety_status,
        "timestamp": "SERVER_TIMESTAMP",
        "blocked": is_unsafe
    }
    
    try:
        # Store in global Scanned URLs collection (without blocked field)
        doc_id = get_url_doc_id(url)
        doc_ref = urls_collection.document(doc_id)
        doc_ref.set(global_data)
        logger.log_struct({
            "message": "Stored/Updated URL in global Scanned URLs",
            "url": url,
            "doc_id": doc_id,
            "data": log_global_data,
            "request_id": request_id
        }, severity="INFO")

        # Store in user-specific collections if user_uid is provided
        if user_uid:
            @firestore.transactional
            def user_specific_write(transaction, url, doc_id, data, log_data, is_unsafe, safety_status, request_id):
                logger.log_text(f"Starting transaction for user-specific write: {url}, user_uid: {user_uid}, request_id: {request_id}", severity="DEBUG")
                
                user_urls_collection = db.collection('users').document(user_uid).collection('scanned_urls')
                user_doc_ref = user_urls_collection.document(doc_id)
                
                # Write to scanned_urls
                transaction.set(user_doc_ref, data)
                logger.log_struct({
                    "message": "Stored/Updated URL in user-specific scanned_urls",
                    "url": url,
                    "user_uid": user_uid,
                    "doc_id": doc_id,
                    "data": log_data,
                    "request_id": request_id
                }, severity="INFO")

                # Write to blocked_list if unsafe
                if is_unsafe:
                    blocked_list = db.collection('users').document(user_uid).collection('blocked_list')
                    blocked_doc_ref = blocked_list.document(doc_id)
                    if not blocked_doc_ref.get().exists:
                        transaction.set(blocked_doc_ref, {
                            "url": url,
                            "reason": safety_status.get("details", {}).get("general", safety_status.get("message", "URL deemed unsafe")),
                            "timestamp": firestore.SERVER_TIMESTAMP
                        })
                        logger.log_struct({
                            "message": "Added URL to user-specific blocked_list",
                            "url": url,
                            "user_uid": user_uid,
                            "doc_id": doc_id,
                            "reason": safety_status.get("message", "URL deemed unsafe"),
                            "request_id": request_id
                        }, severity="INFO")
                    else:
                        logger.log_text(f"URL {url} already in blocked_list for user {user_uid}, request_id: {request_id}", severity="INFO")

            # Run the transaction
            transaction = db.transaction()
            user_specific_write(transaction, url, doc_id, user_data, log_user_data, is_unsafe, safety_status, request_id)

    except Exception as e:
        logger.log_struct({
            "message": "Failed to store in Firestore",
            "url": url,
            "user_uid": user_uid,
            "error": str(e),
            "request_id": request_id
        }, severity="ERROR")
        raise

def store_blocked_website_in_firestore(url: str, safety_status: dict, gemini_summary: str):
    if not url:
        logger.log_text("No URL provided to store as blocked website", severity="ERROR")
        return
    
    if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
        safety_status = {
            "overall": "Error",
            "details": {"general": safety_status if isinstance(safety_status, str) else "Invalid safety status format"}
        }
        gemini_summary = "Error: Invalid safety status format"
    
    existing = blocked_websites_collection.where("url", "==", url).limit(1).get()
    if existing:
        logger.log_text(f"URL {url} already blocked", severity="INFO")
        return
    
    data = {
        "url": url,
        "safety_status": safety_status,
        "gemini_summary": gemini_summary,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "blocked": True
    }
    
    try:
        blocked_websites_collection.add(data)
        logger.log_struct({
            "message": "Stored blocked website in Firestore",
            "url": url,
            "data": data
        }, severity="INFO")
    except Exception as e:
        logger.log_struct({
            "message": "Failed to store blocked website in Firestore",
            "url": url,
            "error": str(e)
        }, severity="ERROR")

def process_and_block_url(url: str, max_attempts: int = 2) -> tuple[dict, str, str]:
    safety_status, found, gemini_summary = check_url_in_firestore(url)
    
    if not found:
        safety_status, gemini_summary = evaluate_url(url)
        store_url_in_firestore(url, safety_status, gemini_summary)
    
    while safety_status["overall"] == "Unknown" and attempt < max_attempts:
        logger.log_text(f"Status is 'Unknown' for {url}, re-evaluating (attempt {attempt + 1}/{max_attempts})", severity="INFO")
        time.sleep(10)
        safety_status, gemini_summary = evaluate_url(url)
        store_url_in_firestore(url, safety_status, gemini_summary)
        attempt += 1
    
    block_status = None
    if safety_status["overall"] in ["Unsafe"]:
        existing = blocked_websites_collection.where("url", "==", url).limit(1).get()
        if existing:
            block_status = "already_blocked"
            logger.log_text(f"URL {url} already blocked in Firestore", severity="INFO")
        else:
            blocked, status = block_unsafe_website(url)
            block_status = status if status else "error"
            if blocked:
                store_blocked_website_in_firestore(url, safety_status, gemini_summary)
        
        if not safety_status.get("details"):
            safety_status["details"] = {}
        if not safety_status["details"].get("url_info"):
            safety_status["details"]["url_info"] = {}
        safety_status["details"]["url_info"]["block_status"] = block_status
    
    store_url_in_firestore(url, safety_status, gemini_summary)
    
    return safety_status, block_status, gemini_summary

if __name__ == "__main__":
    test_url = "https://example.com"
    safety, block, summary = process_and_block_url(test_url)
    logger.log_struct({
        "message": "Test URL processing completed",
        "url": test_url,
        "user_uid": "test_user",
        "safety": safety,
        "block_status": block,
        "gemini_summary": summary
    }, severity="INFO")