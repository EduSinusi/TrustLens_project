import requests
import time
import google.cloud.logging

VIRUSTOTAL_API_KEY = "8eaa84341d3d89952fb99b87430db4cfc5854782b4e52a9031965aaa1c6d58ec"
VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls"

# Initialize Google Cloud Logging
client = google.cloud.logging.Client.from_service_account_json(
    r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
)
logger = client.logger("virustotal")

virustotal_full_results = {}

def check_virustotal(url: str) -> dict:
    if not url:
        logger.log_text("No URL provided to VirusTotal", severity="ERROR")
        return {"status": "Error", "message": "No URL provided"}

    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    payload = {"url": url}

    try:
        submit_response = requests.post(VIRUSTOTAL_URL, data=payload, headers=headers, timeout=10)
        if submit_response.status_code == 429:
            logger.log_text(f"VirusTotal rate limit exceeded for {url}", severity="WARNING")
            return {"status": "Error", "message": "VirusTotal rate limit exceeded. Please try again later."}
        submit_response.raise_for_status()
        analysis_id = submit_response.json()["data"]["id"]
        logger.log_text(f"VirusTotal URL submitted for {url}, analysis ID: {analysis_id}", severity="INFO")

        analysis_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"
        retry_interval = 5
        while True:
            analysis_response = requests.get(analysis_url, headers=headers, timeout=10)
            if analysis_response.status_code == 429:
                logger.log_text(f"VirusTotal rate limit exceeded while polling for {url}", severity="WARNING")
                return {"status": "Error", "message": "VirusTotal rate limit exceeded during polling. Please try again later."}
            if analysis_response.status_code == 200:
                result = analysis_response.json()
                analysis_status = result["data"]["attributes"]["status"]
                if analysis_status == "completed":
                    stats = result["data"]["attributes"]["stats"]
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    undetected = stats.get("undetected", 0)
                    harmless = stats.get("harmless", 0)
                    timeout = stats.get("timeout", 0)

                    scan_results = result["data"]["attributes"].get("results", {})

                    if malicious > 0:
                        status = "Unsafe"
                        message = f"Malicious detections: {malicious}, Suspicious: {suspicious}"
                    elif suspicious > 0 and malicious == 0:
                        status = "Potentially Unsafe"
                        message = f"Suspicious detections: {suspicious}, no malicious findings"
                    elif timeout > 0 and (undetected + harmless == 0):
                        status = "Unknown"
                        message = "Analysis timed out with no conclusive results"
                    else:
                        status = "Safe"
                        message = "No malicious or suspicious detections"

                    virustotal_full_results[url] = {
                        "status": status,
                        "message": message,
                        "stats": {
                            "malicious": malicious,
                            "suspicious": suspicious,
                            "undetected": undetected,
                            "harmless": harmless,
                            "timeout": timeout
                        },
                        "scan_results": scan_results
                    }
                    logger.log_struct({
                        "message": "VirusTotal scan completed",
                        "url": url,
                        "status": status,
                        "message": message
                    }, severity="INFO")
                    return {"status": status, "message": message}
                else:
                    logger.log_text(f"VirusTotal analysis for {url} still in progress...", severity="INFO")
            else:
                logger.log_text(f"VirusTotal polling error for {url}: {analysis_response.status_code}", severity="ERROR")
                return {"status": "Error", "message": f"VirusTotal polling error: {analysis_response.status_code}"}
            time.sleep(retry_interval)

    except requests.exceptions.HTTPError as e:
        error_message = str(e).lower()
        if "400 client error" in error_message:
            reason = "Invalid request format (e.g., malformed URL or missing parameters)"
        elif "401 client error" in error_message:
            reason = "Invalid or unauthorized API key"
        elif "403 client error" in error_message:
            reason = "Access forbidden (check API key permissions)"
        else:
            reason = "Unexpected HTTP error occurred"
        virustotal_full_results[url] = {
            "status": "Unknown",
            "message": f"Could not analyze URL: {reason}",
            "stats": {"malicious": 0, "suspicious": 0, "undetected": 0, "harmless": 0, "timeout": 0},
            "scan_results": {}
        }
        logger.log_struct({
            "message": "VirusTotal HTTP error",
            "url": url,
            "error": str(e),
            "reason": reason
        }, severity="ERROR")
        return {"status": "Unknown", "message": f"Could not analyze URL: {reason}"}
    except requests.exceptions.RequestException as e:
        virustotal_full_results[url] = {
            "status": "Unknown",
            "message": "Could not analyze URL: Network or API connectivity issue",
            "stats": {"malicious": 0, "suspicious": 0, "undetected": 0, "harmless": 0, "timeout": 0},
            "scan_results": {}
        }
        logger.log_struct({
            "message": "VirusTotal API error",
            "url": url,
            "error": str(e)
        }, severity="ERROR")
        return {"status": "Unknown", "message": "Could not analyze URL: Network or API connectivity issue"}

def get_virustotal_full_result(url: str) -> dict:
    if url in virustotal_full_results:
        logger.log_text(f"Retrieved full VirusTotal result for {url} from cache", severity="INFO")
        return virustotal_full_results[url]
    logger.log_text(f"Full VirusTotal result not found for {url}", severity="WARNING")
    return {"error": "Full result not found. Please scan the URL first."}

if __name__ == "__main__":
    test_url = "https://www.google.com"
    result = check_virustotal(test_url)
    logger.log_struct({
        "message": "Test VirusTotal check",
        "url": test_url,
        "result": result
    }, severity="INFO")
    full_result = get_virustotal_full_result(test_url)
    logger.log_struct({
        "message": "Test VirusTotal full result",
        "url": test_url,
        "full_result": full_result
    }, severity="INFO")