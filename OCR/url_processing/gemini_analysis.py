import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.cloud.logging
import google.generativeai as genai

# Initialize Google Cloud Logging
client = google.cloud.logging.Client.from_service_account_json(
    r"C:\Users\USER\Desktop\trust_lens_project\TrustLens_project\OCR\triple-ranger-453716-u9-a59d61bef762.json"  # Adjust to your path
)
logger = client.logger("gemini_analysis")

# Gemini API key
GEMINI_API_KEY = "AIzaSyCnpEePskLvKvSxhL0s2FKJZFABaoX1vso"  # Replace if invalid

# Configure the Gemini client
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request body
class SummarizeRequest(BaseModel):
    domain_security_result: dict

# Function to generate a summary using the Gemini client
def generate_gemini_summary(domain_security_result: dict) -> dict:
    try:
        # Convert the domain security result to a string for the prompt
        result_str = json.dumps(domain_security_result, indent=2)

        result_str = json.dumps(domain_security_result, indent=2)
        logger.log_struct({
            "message": "Generated result_str for Gemini prompt",
            "result_str": result_str,
            "is_empty": len(result_str.strip()) == 0
        }, severity="INFO")
        
        # Create a prompt for Gemini
        prompt = f"""You are an AI-powered cybersecurity assistant helping everyday users evaluate whether a website is safe to visit.

Below is a technical domain security report. Analyze it and provide:
A recommendation: whether the user can safely browse the site or should proceed with caution (e.g., avoid logging in, or don't visit)

Avoid technical jargon, and keep the tone clear, calm, and helpful.

IMPORTANT: Produce the full output without truncating mid-sentence (keep it to 150 tokens limit only).

Security Report:
{result_str}
"""

        # Initialize the Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Configure generation parameters
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_output_tokens": 150,      # ↑ double the budget
        }

        # Generate the summary
        logger.log_text("Generating summary with Gemini client", severity="INFO")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        # Extract the summary from the response
        summary = response.text.strip()
        logger.log_struct({
            "message": "Successfully generated Gemini summary",
            "summary": summary
        }, severity="INFO")
        return {"status": "success", "summary": summary}
    except Exception as e:
        logger.log_struct({
            "message": "Gemini API error",
            "error": str(e)
        }, severity="ERROR")
        return {"status": "error", "message": f"Gemini API error: {str(e)}"}

# FastAPI endpoint to handle Gemini analysis requests
@app.post("/gemini/summarize")
async def summarize_domain_security(request: SummarizeRequest):
    try:
        domain_security_result = request.domain_security_result
        if not domain_security_result:
            logger.log_text("Missing domain_security_result in request", severity="ERROR")
            raise HTTPException(status_code=400, detail="Missing domain_security_result in request")
        
        logger.log_struct({
            "message": "Received request to summarize domain security result",
            "domain_security_result": domain_security_result
        }, severity="INFO")
        
        result = generate_gemini_summary(domain_security_result)
        if result["status"] != "success":
            logger.log_struct({
                "message": "Failed to generate Gemini summary",
                "error": result["message"]
            }, severity="ERROR")
            raise HTTPException(status_code=500, detail=result["message"])
        
        return result
    except Exception as e:
        logger.log_struct({
            "message": "Server error in Gemini summary endpoint",
            "error": str(e)
        }, severity="ERROR")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host="0.0.0.0", port=5001)
    except Exception as e:
        print(f"Failed to start server: {str(e)}")