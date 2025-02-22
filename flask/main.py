from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import fitz
import re
import json

app = Flask(__name__)
# Configure CORS to allow specific origin and handle credentials
CORS(app, resources={r"/*": {"origins": "http://localhost:5173", "supports_credentials": True}})

# ... [Keep the existing ask_gemini route here] ...

# Configure Gemini API Key
API_KEY = "AIzaSyC1bnVlj3c5Ob56gXWgglUkM7xZI76SKsQ"
genai.configure(api_key=API_KEY)

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

@app.route("/schedule", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files or "start_date" not in request.form or "end_date" not in request.form:
            return jsonify({"error": "Missing required inputs"}), 400

        file = request.files["file"]
        start_date = request.form["start_date"]
        end_date = request.form["end_date"]

        # Save and process file
        file_path = os.path.join("temp.pdf")
        file.save(file_path)
        syllabus_text = extract_text_from_pdf(file_path)
        os.remove(file_path)

        # Generate prompt
        prompt = f"""
        Generate a structured teaching schedule in JSON format.
        - Start Date: {start_date}
        - End Date: {end_date}
        - Syllabus: {syllabus_text}
        Output JSON array with: "date", "day", "topic", "hours".
        """

        # Get AI response
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        if not response.text:
            return jsonify({"error": "No valid response from AI"}), 500

        # Clean response and extract JSON
        cleaned_response = re.sub(r'```json|```', '', response.text)
        json_match = re.search(r'(\[.*\]|\{.*\})', cleaned_response, re.DOTALL)
        
        if not json_match:
            return jsonify({"error": "No JSON found in AI response"}), 500

        # Parse JSON
        schedule = json.loads(json_match.group(1))
        print(schedule)
        return jsonify({"schedule": schedule})

    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid JSON format: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)