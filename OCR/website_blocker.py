import os
import platform
import google.cloud.logging

# Initialize Google Cloud Logging
client = google.cloud.logging.Client.from_service_account_json(
    r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
)
logger = client.logger("website_blocker")

def block_unsafe_website(url: str) -> tuple[bool, str]:
    """Block a website by adding it to the hosts file."""
    try:
        if not url:
            logger.log_text("No URL provided for blocking", severity="ERROR")
            return False, "no_url"

        # Normalize URL to extract domain
        domain = url.replace("http://", "").replace("https://", "").split("/")[0]
        if not domain:
            logger.log_text("Invalid domain extracted from URL", severity="ERROR")
            return False, "invalid_url"

        hosts_path = "/etc/hosts" if platform.system() != "Windows" else r"C:\Windows\System32\drivers\etc\hosts"
        redirect_ip = "127.0.0.1"
        entry = f"{redirect_ip} {domain}\n"

        logger.log_text(f"Attempting to block domain: {domain}", severity="INFO")

        # Check if already blocked
        if os.path.exists(hosts_path):
            with open(hosts_path, "r") as file:
                if entry.strip() in file.read():
                    logger.log_text(f"Domain {domain} already blocked in hosts file", severity="INFO")
                    return True, "already_blocked"

        # Write to hosts file
        try:
            with open(hosts_path, "a") as file:
                file.write(entry)
            logger.log_text(f"Successfully blocked domain: {domain}", severity="INFO")
            return True, "blocked"
        except PermissionError:
            logger.log_text(f"Permission denied when writing to {hosts_path}", severity="ERROR")
            return False, "permission_denied"
        except Exception as e:
            logger.log_text(f"Failed to write to hosts file: {str(e)}", severity="ERROR")
            return False, "write_error"

    except Exception as e:
        logger.log_text(f"Error blocking website {url}: {str(e)}", severity="ERROR")
        return False, "error"

if __name__ == "__main__":
    test_url = "example.com"
    success, status = block_unsafe_website(test_url)
    logger.log_struct({
        "message": "Test website blocking",
        "url": test_url,
        "success": success,
        "status": status
    }, severity="INFO")