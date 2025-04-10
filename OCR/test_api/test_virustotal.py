import requests
import time
import json

# Replace with your VirusTotal API key
API_KEY = "8eaa84341d3d89952fb99b87430db4cfc5854782b4e52a9031965aaa1c6d58ec"
BASE_URL = "https://www.virustotal.com/api/v3"

def check_virustotal(url: str) -> dict:
    """Check URL safety using VirusTotal API."""
    headers = {
        "x-apikey": API_KEY,
        "Accept": "application/json"
    }
    
    # Step 1: Submit the URL for scanning
    print(f"\nSubmitting URL for scanning: {url}")
    try:
        response = requests.post(
            f"{BASE_URL}/urls",
            headers=headers,
            data={"url": url}
        )
        print(f"Submission Response Status Code: {response.status_code}")
        print(f"Submission Response Headers: {response.headers}")
        print(f"Submission Response Body: {json.dumps(response.json(), indent=2)}")

        if response.status_code != 200:
            return {
                "status": "Error",
                "message": f"Failed to submit URL: {response.status_code} - {response.text}"
            }
        
        scan_data = response.json()
        analysis_id = scan_data.get("data", {}).get("id")
        if not analysis_id:
            return {
                "status": "Error",
                "message": "No analysis ID returned"
            }
        
        print(f"Analysis ID: {analysis_id}")
    except Exception as e:
        return {
            "status": "Error",
            "message": f"Error submitting URL: {str(e)}"
        }

    # Step 2: Poll for the analysis results
    print("\nPolling for analysis results...")
    max_attempts = 10
    attempt = 0
    while attempt < max_attempts:
        try:
            response = requests.get(
                f"{BASE_URL}/analyses/{analysis_id}",
                headers=headers
            )
            print(f"Attempt {attempt + 1} - Analysis Response Status Code: {response.status_code}")
            print(f"Attempt {attempt + 1} - Analysis Response Headers: {response.headers}")
            print(f"Attempt {attempt + 1} - Analysis Response Body: {json.dumps(response.json(), indent=2)}")

            if response.status_code == 200:
                result = response.json()
                status = result.get("data", {}).get("attributes", {}).get("status")
                
                if status == "completed":
                    stats = result.get("data", {}).get("attributes", {}).get("stats", {})
                    malicious = stats.get("malicious", 0)
                    suspicious = stats.get("suspicious", 0)
                    
                    if malicious > 0 or suspicious > 0:
                        return {
                            "status": "Unsafe",
                            "message": f"Malicious detections: {malicious}, Suspicious: {suspicious}"
                        }
                    return {
                        "status": "Safe",
                        "message": "No malicious detections"
                    }
                
                elif status == "queued" or status == "in-progress":
                    print("Analysis not yet completed, waiting...")
                    time.sleep(5)
                    attempt += 1
                    continue
                
                else:
                    return {
                        "status": "Error",
                        "message": f"Unknown analysis status: {status}"
                    }
            
            else:
                return {
                    "status": "Error",
                    "message": f"Failed to retrieve analysis results: {response.status_code} - {response.text}"
                }
        
        except Exception as e:
            return {
                "status": "Error",
                "message": f"Error retrieving analysis results: {str(e)}"
            }
    
    return {
        "status": "Error",
        "message": "Analysis did not complete within the expected time"
    }

if __name__ == "__main__":
    # Test URLs
    test_urls = [
        "http://sunwayautoparts.com/874ghv3"
          # Replace with a known malicious URL for testing
    ]

    for url in test_urls:
        print(f"\n=== Testing VirusTotal API with URL: {url} ===\n")
        result = check_virustotal(url)
        print(f"\nFinal Result for {url}:")
        print(json.dumps(result, indent=2))
        print("\n" + "="*50 + "\n")