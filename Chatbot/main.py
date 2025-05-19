from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import google.generativeai as genai
import google.cloud.logging
import logging

# Load environment variables
load_dotenv()
# Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyCnpEePskLvKvSxhL0s2FKJZFABaoX1vso"
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables")

# Configure the Gemini client
try:
    genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    logging.error(f"Failed to configure Gemini API: {str(e)}")
    raise

# Initialize Google Cloud Logging
try:
    client = google.cloud.logging.Client.from_service_account_json(
        r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"
    )
    logger = client.logger("gemini_chatbot")
except Exception as e:
    logging.error(f"Failed to initialize Google Cloud Logging: {str(e)}")
    logger = logging.getLogger("gemini_chatbot")

# Initialize FastAPI
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    # Use log_text for Google Cloud Logging
    logger.log_text(f"Received prompt from user: {request.prompt}", severity="INFO")
    try:
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            request.prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 1000,
            },
        )
        output = response.text.strip()
        logger.log_text(f"Gemini responded successfully: {output}", severity="INFO")
        return {"response": output}
    except Exception as e:
        logger.log_text(f"Gemini API error: {str(e)}", severity="ERROR")
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# Run server
if __name__ == "__main__":
    import uvicorn
    try:
        # Check if logger is a Google Cloud Logger or fallback
        if isinstance(logger, google.cloud.logging.Logger):
            logger.log_text("Starting FastAPI server on port 7000", severity="INFO")
        else:
            logger.info("Starting FastAPI server on port 7000")
        uvicorn.run("main:app", host="0.0.0.0", port=7000, reload=True)
    except Exception as e:
        if isinstance(logger, google.cloud.logging.Logger):
            logger.log_text(f"Failed to start server: {str(e)}", severity="ERROR")
        else:
            logger.error(f"Failed to start server: {str(e)}")
        raise