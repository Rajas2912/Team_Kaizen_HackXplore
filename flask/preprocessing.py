from flask import Flask, request, jsonify
import os
import json
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai
import fitz  # PyMuPDF

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure APIs
API_KEY = "AIzaSyA9MjZo6sIOlCQPQo5ojKBdHnGmUjlcsGc"
genai.configure(api_key=API_KEY)

# Helper Functions
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF using PyMuPDF."""
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

def divide_syllabus_into_lectures(syllabus_text, num_lectures):
    """Use Gemini to divide the syllabus into the specified number of lectures."""
    prompt = f"""
    Divide the following syllabus into {num_lectures} lectures.
    Return the output as a JSON array where each item represents a lecture and has the following keys:
    - "lecture_number" (e.g., 1, 2, 3)
    - "topics" (list of topics covered in the lecture)

    Example:
    [
        {{
            "lecture_number": 1,
            "topics": [
                "Introduction to Computer Networks",
                "LAN, MAN, WAN, PAN, Ad hoc Networks"
            ]
        }},
        {{
            "lecture_number": 2,
            "topics": [
                "Network Architectures: Client-Server, Peer-to-Peer",
                "Network Topologies: Bus, Ring, Tree, Star, Mesh, Hybrid"
            ]
        }}
    ]

    Syllabus:
    {syllabus_text}
    """

    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)

    if not response.text:
        raise ValueError("No valid response from AI")

    # Clean the response to extract JSON
    cleaned_response = response.text.strip()
    json_match = re.search(r"\[.*\]", cleaned_response, re.DOTALL)

    if not json_match:
        raise ValueError("No JSON found in AI response")

    try:
        return json.loads(json_match.group(0))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {e}")

# Routes
@app.route("/divide_syllabus", methods=["POST"])
def divide_syllabus():
    """Divide the syllabus into the specified number of lectures."""
    try:
        if "file" not in request.files or "num_lectures" not in request.form:
            return jsonify({"error": "Missing required inputs"}), 400

        # Get the uploaded file and form data
        file = request.files["file"]
        num_lectures = int(request.form["num_lectures"])

        # Save the file temporarily
        file_path = os.path.join("temp.pdf")
        file.save(file_path)

        # Extract text from the PDF
        syllabus_text = extract_text_from_pdf(file_path)

        # Clean up the temporary file
        os.remove(file_path)

        if not syllabus_text:
            return jsonify({"error": "Failed to extract text from PDF"}), 400

        # Divide the syllabus into lectures
        lectures = divide_syllabus_into_lectures(syllabus_text, num_lectures)

        return jsonify({"lectures": lectures})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)