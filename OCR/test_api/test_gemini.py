import google.generativeai as genai

# Configure API key
GEMINI_API_KEY = "AIzaSyCnpEePskLvKvSxhL0s2FKJZFABaoX1vso"  # Replace if invalid
genai.configure(api_key=GEMINI_API_KEY)

try:
    # Initialize the Gemini model
    model = genai.GenerativeModel('gemini-1.5-flash')  # Use a valid model
    # Test prompt
    response = model.generate_content("Explain how AI works in 2-3 sentences.")
    print("Response from Gemini API:")
    print(response.text)
except Exception as e:
    print(f"Error: {str(e)}")