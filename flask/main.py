from flask import Flask, request, jsonify
from flask_cors import CORS  # PyMuPDF for PDF text extraction
import google.generativeai as genai
import os
import fitz
import datetime
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/ask_gemini", methods=["GET"])
def ask_gemini():
    """
    Sends a prompt to the Gemini API and returns the response.

    Query Parameters:
    - prompt: The complete formatted prompt including system instructions, source document, and question.
    - api_key: The API key to authenticate the request.

    Returns:
    - JSON response containing Gemini's generated text.
    """
    prompt = request.args.get("prompt")
    api_key = request.args.get("api_key")

    if not prompt or not api_key:
        return jsonify({"error": "Missing 'prompt' or 'api_key'"}), 400

    # Configure API
    genai.configure(api_key=api_key)

    # Initialize the model
    model = genai.GenerativeModel("gemini-pro")

    # Get response
    response = model.generate_content(prompt)

    return jsonify({"response": response.text})

# Configure Gemini API Key
API_KEY = "AIzaSyC1bnVlj3c5Ob56gXWgglUkM7xZI76SKsQ"
genai.configure(api_key=API_KEY)

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

@app.route("/schedule", methods=["POST"])
def upload_file():
    if "file" not in request.files or "start_date" not in request.form or "end_date" not in request.form:
        return jsonify({"error": "Missing required inputs"}), 400

    file = request.files["file"]
    start_date = request.form["start_date"]
    end_date = request.form["end_date"]

    # Save file temporarily
    file_path = os.path.join("temp.pdf")
    file.save(file_path)

    # Extract text from PDF
    syllabus_text = extract_text_from_pdf(file_path)
    os.remove(file_path)  # Clean up

    # Create prompt for Gemini
    prompt = f"""
    I am providing a syllabus along with semester details. Your task is to generate a structured teaching schedule in tabular format.**Details:**
    - Start Date: {start_date}
    - End Date: {end_date}
    - Syllabus:{syllabus_text}
    **Requirements:**
    - Generate a structured table where each lecture has a Date, Day, Topic and number of hours required according to which topic is hard or that topic is easy  in json format.
    - Ensure topics are distributed evenly from start to end date.
    - Format response in a JSON array with fields: "date", "day",  "topic" , "hours".
    """

    # Call Gemini API
    model = genai.GenerativeModel("gemini-pro")
    

    # Convert response to structured JSON (assumes well-formatted output)
    import json
    
    response = model.generate_content(prompt)

    print("Gemini API Response:", response)
        
    # Ensure response has text
    if not hasattr(response, "text") or not response.text:
            return jsonify({"error": "No valid response from AI"}), 500
        
    ai_response = response.text.strip()
    match = re.search(r"\{.*\}|\[.*\]", ai_response, re.DOTALL)
    if not match:
        return jsonify({"error": "Failed to extract JSON from AI response"}), 500

    json_text = match.group(0)  # Extracted JSON
    print(json_text)
    schedule = json.loads(json_text)
    return jsonify({"raw_schedule": schedule})
    # # print("Raw AI Response:", ai_response)
    # json_start = ai_response.find("{")
    # json_end = ai_response.rfind("}") + 1
    # json_text = ai_response[json_start:json_end]
    # print(json_text + " \n hello")
    # schedule = json.loads(json_text)
    # return jsonify({"raw_schedule": json_text})
    
if __name__ == "__main__":
    app.run(debug=True)