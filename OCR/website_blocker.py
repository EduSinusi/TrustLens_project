import os

HOSTS_FILE = r"C:\Windows\System32\drivers\etc\hosts"  # Path to the hosts file on Windows
REDIRECT_IP = "127.0.0.1"  # Redirect unsafe websites to localhost

def block_in_hosts(domain):
    """
    Block a domain by adding it to the hosts file.
    Returns a tuple (success: bool, status: str) where status is 'blocked' or 'already_blocked'.
    """
    try:
        # Read the current hosts file
        with open(HOSTS_FILE, "r") as file:
            content = file.read()
            # Check if the domain is already blocked (with or without www)
            if f"{REDIRECT_IP} {domain}" in content or f"{REDIRECT_IP} www.{domain}" in content:
                print(f"{domain} is already blocked in the hosts file.")
                return True, "already_blocked"

        # Add the domain to the hosts file
        with open(HOSTS_FILE, "a") as file:
            file.write(f"\n{REDIRECT_IP} {domain}\n")
            file.write(f"{REDIRECT_IP} www.{domain}\n")  # Also block the www version
            print(f"Blocked {domain} and www.{domain} in the hosts file.")
        return True, "blocked"
    except PermissionError:
        print("Permission denied: Run this script as an administrator to modify the hosts file.")
        return False, "permission_denied"
    except Exception as e:
        print(f"Failed to block {domain} in the hosts file. Error: {e}")
        return False, "error"

def extract_domain(url):
    """
    Extract the domain from a URL.
    """
    from urllib.parse import urlparse
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    # Remove www. prefix if present
    if domain.startswith("www."):
        domain = domain[4:]
    return domain

def block_unsafe_website(url):
    """
    Block an unsafe website by adding it to the hosts file.
    Returns a tuple (success: bool, status: str) where status indicates the blocking outcome.
    """
    try:
        domain = extract_domain(url)
        if not domain:
            print(f"Invalid URL: {url}")
            return False, "invalid_url"

        success, status = block_in_hosts(domain)
        if success:
            print(f"Successfully {status}: {domain}")
        else:
            print(f"Failed to block: {domain} (Status: {status})")
        return success, status
    except Exception as e:
        print(f"Failed to block website: {url}. Error: {e}")
        return False, "error"