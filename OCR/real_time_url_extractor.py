import cv2
import re
from pyzbar.pyzbar import decode
from google.cloud import vision_v1
from google.cloud.vision_v1 import types
from google.oauth2 import service_account
import google.cloud.logging

# Initialize Google Cloud Logging and Vision API with the same credentials
SERVICE_ACCOUNT_FILE = r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
try:
    credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
    vision_client = vision_v1.ImageAnnotatorClient(credentials=credentials)
    logging_client = google.cloud.logging.Client(credentials=credentials)
    logger = logging_client.logger("real_time_url_extractor")
except Exception as e:
    logger.log_text(f"Failed to initialize Google Cloud services: {str(e)}", severity="ERROR")
    vision_client = None

def preprocess_image(image):
    """Enhance image quality for better OCR results."""
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        alpha = 1.3
        beta = 20
        adjusted = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)
        denoised = cv2.bilateralFilter(adjusted, d=5, sigmaColor=50, sigmaSpace=50)
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        logger.log_text("Image preprocessing completed successfully", severity="DEBUG")
        return thresh
    except Exception as e:
        logger.log_text(f"Image preprocessing failed: {str(e)}", severity="ERROR")
        return None

def extract_url_from_qr_code(image):
    """Extract URL from QR code in the image."""
    try:
        decoded_objects = decode(image)
        for obj in decoded_objects:
            if obj.type == 'QRCODE':
                url = obj.data.decode('utf-8')
                logger.log_text(f"QR Code detected: {url}", severity="INFO")
                return url
        logger.log_text("No QR code detected in image", severity="DEBUG")
        return None
    except Exception as e:
        logger.log_text(f"QR code extraction failed: {str(e)}", severity="ERROR")
        return None

def extract_url_from_text(image):
    """Extract URL from text in the image using Google Cloud Vision API."""
    if vision_client is None:
        logger.log_text("Google Vision API client not initialized", severity="ERROR")
        return None

    try:
        success, encoded_image = cv2.imencode('.jpg', image)
        if not success:
            logger.log_text("Failed to encode image for Vision API", severity="ERROR")
            return None
        content = encoded_image.tobytes()

        image = types.Image(content=content)
        response = vision_client.document_text_detection(image=image)
        if response.error.message:
            logger.log_text(f"Vision API error: {response.error.message}", severity="ERROR")
            return None

        text = response.full_text_annotation.text if response.full_text_annotation else ""
        logger.log_text(f"Raw text from Vision API: '{text}'", severity="DEBUG")

        if not text:
            logger.log_text("No text detected by Vision API", severity="INFO")
            return None

        # Simple regex for URL detection
        url_pattern = r'(https?://[^\s<>"]+|www\.[^\s<>"]+)'
        urls = re.findall(url_pattern, text)
        if urls:
            url = urls[0]
            logger.log_text(f"URL extracted from text: {url}", severity="INFO")
            return url
        else:
            logger.log_text("No URLs found in detected text", severity="INFO")
            return None

    except Exception as e:
        logger.log_text(f"Text extraction failed: {str(e)}", severity="ERROR")
        return None

if __name__ == "__main__":
    # Test the functionality
    test_image_path = "path/to/test/image.jpg"
    try:
        image = cv2.imread(test_image_path)
        if image is None:
            logger.log_text(f"Failed to load test image: {test_image_path}", severity="ERROR")
        else:
            logger.log_text(f"Testing URL extraction on image: {test_image_path}", severity="INFO")
            processed_image = preprocess_image(image)
            if processed_image is not None:
                url = extract_url_from_qr_code(processed_image)
                if url:
                    logger.log_text(f"Test QR code URL: {url}", severity="INFO")
                else:
                    url = extract_url_from_text(processed_image)
                    if url:
                        logger.log_text(f"Test text URL: {url}", severity="INFO")
                    else:
                        logger.log_text("No URL found in test image", severity="INFO")
            else:
                logger.log_text("Test image preprocessing failed", severity="ERROR")
    except Exception as e:
        logger.log_text(f"Test failed: {str(e)}", severity="ERROR")