import firebase_admin
from firebase_admin import credentials, firestore
from .virustotal import check_virustotal, get_virustotal_full_result
from .UrlSecurityCheck import check_url_info
from website_blocker import block_unsafe_website
import time

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(
        r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\trustlens-cbf72-firebase-adminsdk-fbsvc-b5be2f6954.json"
    )
    firebase_admin.initialize_app(cred)

db = firestore.client()
urls_collection = db.collection('Scanned URLs')
blocked_websites_collection = db.collection('Blocked Websites')

def check_url_in_firestore(url: str) -> tuple[dict, bool]:
    """Check if URL exists in Firestore and verify if it has complete API data."""
    if not url:
        return {"overall": "Error", "details": {"general": "No URL to check"}}, False

    try:
        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc = query[0].to_dict()
            safety_status = doc.get("safety_status", {"overall": "Unknown", "details": {}})
            print(f"Found in Firestore: {doc}")
            
            # Check if all required API data exists
            details = safety_status.get("details", {})
            required_apis = {"virustotal", "url_info"}
            has_all_data = all(api in details and details[api] for api in required_apis)
            
            if has_all_data:
                return safety_status, True
            else:
                print(f"URL {url} found but missing some API data, proceeding to full evaluation.")
                return None, False
        print(f"URL {url} not found in Firestore, proceeding to evaluate.")
        return None, False
    except Exception as e:
        return {"overall": "Error", "details": {"general": f"Firestore error: {str(e)}"}}, False

def evaluate_url(url: str) -> dict:
    """Evaluate URL using VirusTotal and TrustLens URL Security Check."""
    print(f"Evaluating URL: {url}")
    
    # Get VirusTotal result (no "Pending" status, will wait until complete)
    virustotal_result = check_virustotal(url)
    virustotal_full_result = get_virustotal_full_result(url)

    # If the full result is not available, use a default
    if "error" in virustotal_full_result:
        virustotal_full_result = {
            "status": virustotal_result["status"],
            "message": virustotal_result["message"],
            "stats": {
                "malicious": 0,
                "suspicious": 0,
                "undetected": 0,
                "harmless": 0,
                "timeout": 0
            },
            "scan_results": {}
        }

    # Get URLSecurityCheck result
    url_info_result = check_url_info(url)

    # If domain does not exist, return immediately
    if url_info_result["status"] == "Non-existent":
        return {
            "overall": "URL does not exist",
            "details": {
                "virustotal": virustotal_full_result,
                "url_info": url_info_result
            }
        }

    results = {
        "virustotal": virustotal_full_result,
        "url_info": url_info_result
    }
    
    # Log the results from each service for debugging
    print(f"Evaluation Results for {url}:")
    for service, result in results.items():
        print(f"{service}: {result}")

    # Check if TrustLens determined the domain is non-existent
    url_info_status = url_info_result["status"]
    if url_info_status in ["Non-existent", "Unknown"]:
        overall = "Unknown"
        message = "Domain does not exist in DNS"
        # Ensure VirusTotal result is not included
        if "virustotal" in results:
            del results["virustotal"]
        safety_status = {
            "overall": overall,
            "message": message,
            "details": results
        }
        print(f"Evaluated Safety Status: {safety_status}")
        return safety_status

    # If domain exists, proceed with hybrid decision-making
    virustotal_status = virustotal_full_result["status"]
    url_info_security_score = url_info_result["details"]["security_score"]

    # Rule-based decision making
    if virustotal_status == "Unsafe" and url_info_status == "Unsafe":
        overall = "Unsafe"
        message = "Detected as unsafe by VirusTotal or TrustLens URL Security Check"
    elif virustotal_status == "Safe" and url_info_status == "Unsafe":
        overall = "Safe"
        message = "VirusTotal indicates safe, but TrustLens URL Security Check found potential risks"
    elif virustotal_status == "Safe" and url_info_status == "Safe":
        overall = "Safe"
        message = "Both VirusTotal and TrustLens URL Security Check indicate the URL is safe"
    elif virustotal_status == "Safe" and url_info_status == "Potentially Unsafe":
        overall = "Safe"
        message = "VirusTotal indicates safe, but TrustLens URL Security Check found potential risks"
    elif virustotal_status == "Unsafe" and url_info_status == "Potentially Unsafe":
        overall = "Unsafe"
        message = "Detected as unsafe by VirusTotal, and TrustLens URL Security Check also found potential risks"
    elif virustotal_status == "Unknown" and url_info_status == "Safe":
        overall = "Unknown"
        message = "VirusTotal is inconclusive, but TrustLens URL Security Check indicates the URL is safe"
    elif virustotal_status == "Unknown" and url_info_status == "Potentially Unsafe":
        overall = "Unknown"
        message = "VirusTotal is inconclusive, and TrustLens URL Security Check found potential risks"
    elif virustotal_status == "Safe" and url_info_status == "Unknown":
        overall = "Unknown"
        message = "TrustLens URL Security Check is inconclusive, but VirusTotal indicates the URL is safe"
    elif virustotal_status == "Unknown" and url_info_status == "Unknown":
        overall = "Unknown"
        message = "Both VirusTotal and TrustLens URL Security Check are inconclusive"
    else:
        overall = "Potentially Unsafe"
        message = "Mixed signals from VirusTotal and TrustLens URL Security Check"

    safety_status = {
        "overall": overall,
        "message": message,
        "details": results
    }
    print(f"Evaluated Safety Status: {safety_status}")
    return safety_status

def store_url_in_firestore(url: str, safety_status: dict):
    """Store or update URL evaluation in Firestore."""
    if not url:
        return
    
    # Ensure safety_status is a dict with overall and details
    if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
        safety_status = {
            "overall": "Error",
            "details": {"general": safety_status if isinstance(safety_status, str) else "Invalid safety status format"}
        }
    
    data = {
        "url": url,
        "safety_status": safety_status,
        "timestamp": firestore.SERVER_TIMESTAMP
    }
    
    try:
        query = urls_collection.where("url", "==", url).limit(1).get()
        if query:
            doc_ref = query[0].reference
            doc_ref.set(data)
            print(f"Updated in Firestore (Scanned URLs): {data}")
        else:
            urls_collection.add(data)
            print(f"Stored in Firestore (Scanned URLs): {data}")
    except Exception as e:
        print(f"Failed to store in Firestore: {e}")

def store_blocked_website_in_firestore(url: str, safety_status: dict):
    """Store blocked URL in Firestore."""
    if not url:
        return
    
    if not isinstance(safety_status, dict) or "overall" not in safety_status or "details" not in safety_status:
        safety_status = {
            "overall": "Error",
            "details": {"general": safety_status if isinstance(safety_status, str) else "Invalid safety status format"}
        }
    
    existing = blocked_websites_collection.where("url", "==", url).limit(1).get()
    if existing:
        print(f"URL {url} already blocked.")
        return
    
    data = {
        "url": url,
        "safety_status": safety_status,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "blocked": True
    }
    
    try:
        blocked_websites_collection.add(data)
        print(f"Stored in Firestore (Blocked Websites): {data}")
    except Exception as e:
        print(f"Failed to store in Firestore: {e}")

def process_and_block_url(url: str, max_attempts: int = 2) -> tuple[dict, str]:
    """Process URL, re-evaluate if 'Unknown', and block if unsafe."""
    safety_status, found = check_url_in_firestore(url)
    
    attempt = 1
    if not found:
        safety_status = evaluate_url(url)
        store_url_in_firestore(url, safety_status)
    
    while safety_status["overall"] == "Unknown" and attempt < max_attempts:
        print(f"Status is 'Unknown' for {url}, re-evaluating (attempt {attempt + 1}/{max_attempts})...")
        time.sleep(10)  # Add a delay to give the API time to process
        safety_status = evaluate_url(url)
        store_url_in_firestore(url, safety_status)
        attempt += 1
    
    block_status = None
    if safety_status["overall"] in ["Unsafe"]:
        existing = blocked_websites_collection.where("url", "==", url).limit(1).get()
        if existing:
            block_status = "already_blocked"
        else:
            blocked, status = block_unsafe_website(url)
            if blocked:
                store_blocked_website_in_firestore(url, safety_status)
            block_status = status
    
    return safety_status, block_status

if __name__ == "__main__":
    test_url = "https://example.com"
    safety, block = process_and_block_url(test_url)
    print(f"Safety: {safety}, Block Status: {block}")