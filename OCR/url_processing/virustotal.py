import requests
import time

VIRUSTOTAL_API_KEY = "8eaa84341d3d89952fb99b87430db4cfc5854782b4e52a9031965aaa1c6d58ec"  # Replace with your valid API key
VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls"

virustotal_full_results = {}

def check_virustotal(url: str) -> dict:
    """Check URL safety using VirusTotal API and store full result."""
    if not url:
        return {"status": "Error", "message": "No URL provided"}

    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    payload = {"url": url}

    try:
        # Step 1: Submit the URL for analysis
        submit_response = requests.post(VIRUSTOTAL_URL, data=payload, headers=headers, timeout=10)
        if submit_response.status_code == 429:
            print(f"VirusTotal rate limit exceeded for {url}")
            return {"status": "Error", "message": "VirusTotal rate limit exceeded. Please try again later."}
        submit_response.raise_for_status()  # Raises an exception for 4xx/5xx errors
        analysis_id = submit_response.json()["data"]["id"]
        print(f"VirusTotal URL submitted for {url}, analysis ID: {analysis_id}")

        # Step 2: Poll for analysis results until complete
        analysis_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"
        retry_interval = 5  # 5 seconds between retries
        while True:
            analysis_response = requests.get(analysis_url, headers=headers, timeout=10)
            if analysis_response.status_code == 429:
                print(f"VirusTotal rate limit exceeded while polling for {url}")
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

                    # Fetch detailed scan results (per-engine results)
                    scan_results = result["data"]["attributes"].get("results", {})

                    # Refined status logic
                    if malicious > 0 or suspicious > 0:
                        status = "Unsafe"
                        message = f"Malicious detections: {malicious}, Suspicious: {suspicious}"
                    elif timeout > 0 and (undetected + harmless == 0):
                        status = "Unknown"
                        message = "Analysis timed out with no conclusive results"
                    else:
                        status = "Safe"
                        message = "No malicious or suspicious detections"

                    # Store full result, including per-engine results
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
                        "scan_results": scan_results  # Store detailed per-engine results
                    }
                    print(f"VirusTotal scan completed for {url}: {status} ({message})")
                    return {"status": status, "message": message}
                else:
                    print(f"VirusTotal analysis for {url} still in progress...")
            else:
                print(f"VirusTotal polling error for {url}: {analysis_response.status_code}")
                return {"status": "Error", "message": f"VirusTotal polling error: {analysis_response.status_code}"}
            time.sleep(retry_interval)

    except requests.exceptions.HTTPError as e:
        print(f"VirusTotal HTTP error for {url}: {str(e)}")
        return {"status": "Error", "message": f"VirusTotal HTTP error: {str(e)}"}
    except requests.exceptions.RequestException as e:
        print(f"VirusTotal API error for {url}: {str(e)}")
        return {"status": "Error", "message": f"VirusTotal API error: {str(e)}"}

def get_virustotal_full_result(url: str) -> dict:
    """Retrieve the full VirusTotal scan result for a given URL."""
    if url in virustotal_full_results:
        return virustotal_full_results[url]
    return {"error": "Full result not found. Please scan the URL first."}

# Test the function with a known URL
if __name__ == "__main__":
    test_url = "https://www.google.com"
    result = check_virustotal(test_url)
    print(f"Test result for {test_url}: {result}")
    full_result = get_virustotal_full_result(test_url)
    print(f"Full result for {test_url}: {full_result}")