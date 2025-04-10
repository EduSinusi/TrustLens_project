import requests

SAFE_BROWSING_API_KEY = "AIzaSyAvARaqeLzyvCdUfWes0wNpKpp7vYh4iuQ"  # Replace with your actual key
SAFE_BROWSING_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

def check_google_safe_browsing(url: str) -> dict:
    """Check URL safety using Google Safe Browsing API."""
    if not url:
        return {"status": "Error", "message": "No URL provided"}

    payload = {
        "client": {"clientId": "trustlens-project", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    
    params = {"key": SAFE_BROWSING_API_KEY}
    
    try:
        response = requests.post(SAFE_BROWSING_URL, json=payload, params=params, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        if "matches" in result:
            threats = {f"{match['threatType']} ({match['platformType']})" for match in result["matches"]}
            return {"status": "Unsafe", "message": f"Threats detected: {', '.join(sorted(threats))}"}
        return {"status": "Safe", "message": "No threats detected"}
    except requests.exceptions.RequestException as e:
        return {"status": "Error", "message": f"Google Safe Browsing API error: {str(e)}"}

if __name__ == "__main__":
    test_url = "https://example.com"
    result = check_google_safe_browsing(test_url)
    print(f"Google Safe Browsing: {result}")