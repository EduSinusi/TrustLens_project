import cv2
import re
from pyzbar.pyzbar import decode  # For QR code detection
from google.cloud import vision_v1
from google.cloud.vision_v1 import types
from google.oauth2 import service_account

# Initialize Google Vision API
SERVICE_ACCOUNT_FILE = r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
try:
    credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
    vision_client = vision_v1.ImageAnnotatorClient(credentials=credentials)
except Exception as e:
    print(f"Failed to initialize Google Vision API: {e}")
    vision_client = None

def preprocess_image(image):
    """Enhance image quality for better OCR results."""
    # Convert to grayscale for better text detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Apply slight contrast and brightness adjustments
    alpha = 1.3  # Reduced contrast to avoid over-sharpening
    beta = 20     # Reduced brightness
    adjusted = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)
    # Denoise with a lighter filter to preserve text details
    denoised = cv2.bilateralFilter(adjusted, d=5, sigmaColor=50, sigmaSpace=50)
    # Apply adaptive thresholding to enhance text
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    return thresh

def extract_url_from_qr_code(image):
    """Extract URLs from QR codes in the image."""
    decoded_objects = decode(image)
    for obj in decoded_objects:
        if obj.type == 'QRCODE':
            url = obj.data.decode('utf-8')
            print(f"QR Code detected: {url}")
            return url
    return None

def extract_url_from_text(image):
    """Extract URLs from image using Google Vision API."""
    if vision_client is None:
        print("Google Vision API client not initialized")
        return None

    # Convert image to the format expected by Google Vision API
    success, encoded_image = cv2.imencode('.jpg', image)
    if not success:
        print("Failed to encode image for Vision API")
        return None
    content = encoded_image.tobytes()

    image = types.Image(content=content)
    try:
        # Use document_text_detection for better text detection
        response = vision_client.document_text_detection(image=image)
        if response.error.message:
            print(f"Vision API error: {response.error.message}")
            return None

        # Extract full text from the response
        text = response.full_text_annotation.text if response.full_text_annotation else ""
        print(f"Raw text from Vision API: '{text}'")

        if not text:
            print("No text detected by Vision API")
            return None

        # Search for URLs in the detected text
        url_pattern = r'(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2})?[^\s]*)'
        match = re.search(url_pattern, text, re.IGNORECASE)
        if not match:
            print("No URL matched in text")
            return None

        url = match.group(0)
        url = re.sub(r'[.,;:!?)\]\}]+$', '', url)
        print(f"Extracted URL: {url}")

        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        return url
    except Exception as e:
        print(f"Error during Vision API text detection: {e}")
        return None

def process_video_frames(camera_index=0):
    """Capture video frames from the webcam and extract URLs in real-time."""
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"Failed to open webcam at index {camera_index}")
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to capture frame")
                break

            # Preprocess the frame
            processed_frame = preprocess_image(frame)

            # Try extracting URL from QR code
            url = extract_url_from_qr_code(processed_frame)
            if not url:
                # Fallback to text-based URL extraction
                url = extract_url_from_text(processed_frame)

            if url:
                print(f"Extracted URL: {url}")
                # Display the extracted URL on the frame
                cv2.putText(frame, f"URL: {url}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # Show the frame
            cv2.imshow("Webcam Feed", frame)

            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    # Use external webcam (index 1) or laptop webcam (index 0)
    process_video_frames(camera_index=1)  # Change to 1 for external webcam