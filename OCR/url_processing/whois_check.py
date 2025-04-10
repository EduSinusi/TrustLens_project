import whois
from datetime import datetime
import re

def check_domain_age(url: str) -> dict:
    """Check domain age using WHOIS."""
    try:
        # Extract domain name from URL
        domain_match = re.search(r'(?:https?://)?(?:www\.)?([^/]+\.[^/]+)', url)
        if not domain_match:
            return {"status": "Error", "message": "Invalid URL format"}
        domain_name = domain_match.group(1)

        # Query WHOIS database
        domain = whois.whois(domain_name)
        if not domain.creation_date:
            return {"status": "Unknown", "message": "Domain not found in WHOIS database"}

        # Handle creation date (sometimes returned as a list)
        creation_date = domain.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        # Validate creation date format
        if not isinstance(creation_date, datetime):
            return {"status": "Error", "message": "Invalid creation date format"}

        # Calculate domain age
        age = (datetime.now() - creation_date).days
        if age < 0:
            return {"status": "Error", "message": "Creation date in future"}

        # Strictly mark domains less than 30 days old as "Suspicious"
        status = "Suspicious" if age < 30 else "Safe"
        return {
            "status": status,
            "message": f"Domain created on {creation_date.strftime('%Y-%m-%d')} ({age} days old)"
        }
    except Exception as e:
        # Simplify the error message for WHOIS lookup failures
        return {"status": "Unknown", "message": "Domain not found in WHOIS database"}

if __name__ == "__main__":
    test_url = "https://testsafebrowsing.appspot.com"
    result = check_domain_age(test_url)
    print(f"WHOIS: {result}")