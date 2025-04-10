import whois
from datetime import datetime
import re

def check_domain_age(url):
    try:
        # Extract domain from URL
        domain_match = re.search(r'(?:https?://)?(?:www\.)?([^/]+\.[^/]+)', url)
        if not domain_match:
            raise ValueError("Invalid URL format")
        domain_name = domain_match.group(1)

        # Query WHOIS
        domain = whois.whois(domain_name)
        if not domain.creation_date:
            raise ValueError("No creation date available")

        creation_date = domain.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]  # Take earliest date

        if not isinstance(creation_date, datetime):
            raise ValueError("Invalid creation date format")

        age = (datetime.now() - creation_date).days
        if age < 0:
            raise ValueError("Creation date in future")

        # Return both creation date (as string) and age
        return {
            "creation_date": creation_date.strftime('%Y-%m-%d'),
            "age_days": age
        }
    except Exception as e:
        print(f"WHOIS error for {url}: {str(e)}")
        return {
            "creation_date": "Unknown",
            "age_days": 30  # Default fallback
        }

# Test the function
if __name__ == "__main__":
    urls = ["https://scandiweb.weebly.com/"]
    for url in urls:
        result = check_domain_age(url)
        print(f"URL: {url}")
        print(f"Creation Date: {result['creation_date']}")
        print(f"Age (days): {result['age_days']}\n")