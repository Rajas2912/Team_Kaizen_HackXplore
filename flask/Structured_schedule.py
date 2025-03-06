from flask import Flask, request, jsonify
import os
import json
import re
from datetime import datetime, timedelta
import google.generativeai as genai
import fitz  # PyMuPDF

# Load environment variables

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

def structure_syllabus_for_timetable(syllabus_text):
    """Use Gemini to structure the syllabus for timetable generation."""
    prompt = f"""
    Structure the following syllabus into a format suitable for generating a timetable.
    Return the output as a JSON array where each item has the following keys:
    - "topic" (a brief description of the topic)
    - "hours" (number of hours for the topic, e.g., 2)

    Example:
    [
        {{
            "topic": "Introduction to Python",
            "hours": 2
        }},
        {{
            "topic": "Data Types and Variables",
            "hours": 2
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

def generate_timetable(structured_syllabus, start_date, end_date, lectures_per_week):
    """Generate a timetable from structured syllabus."""
    timetable = []
    current_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    # Calculate the number of lectures per day
    lectures_per_day = max(1, lectures_per_week // 5)  # Ensure at least 1 lecture per day

    # Iterate through the structured syllabus
    topic_index = 0
    while current_date <= end_date and topic_index < len(structured_syllabus):
        # Skip Saturdays and Sundays
        if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            current_date += timedelta(days=1)
            continue

        # Add lectures for the current day
        for _ in range(lectures_per_day):
            if topic_index >= len(structured_syllabus):
                break

            # Add the topic to the timetable
            timetable.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day": current_date.strftime("%A"),
                "topic": structured_syllabus[topic_index]["topic"],
                "hours": structured_syllabus[topic_index]["hours"]
            })

            # Move to the next topic
            topic_index += 1

        # Move to the next day
        current_date += timedelta(days=1)

    return timetable


def structure_syllabus_into_modules(syllabus_text):
    """Use Gemini to structure the syllabus into modules."""
    prompt = f"""
    Structure the following syllabus into modules. Each module should have a title and a list of topics.
    Return the output as a JSON array where each module has the following keys:
    - "module_title" (title of the module)
    - "topics" (list of topics under the module)

    Example:
    [
        {{
            "module_title": "Introduction to Python",
            "topics": [
                "Python Basics",
                "Data Types",
                "Control Structures"
            ]
        }},
        {{
            "module_title": "Advanced Python",
            "topics": [
                "Functions",
                "Classes and Objects",
                "File Handling"
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
@app.route("/module_wise", methods=["POST"])
def module_wise():
    """Structure the syllabus into modules."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "Missing file"}), 400

        # Get the uploaded file
        file = request.files["file"]

        # Save the file temporarily
        file_path = os.path.join("temp.pdf")
        file.save(file_path)

        # Extract text from the PDF
        syllabus_text = extract_text_from_pdf(file_path)

        # Clean up the temporary file
        os.remove(file_path)

        if not syllabus_text:
            return jsonify({"error": "Failed to extract text from PDF"}), 400

        # Structure the syllabus into modules
        modules = structure_syllabus_into_modules(syllabus_text)

        return jsonify({"modules": modules})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/structured", methods=["POST"])
def structured():
    """Generate a timetable from a syllabus PDF."""
    try:
        if "file" not in request.files or "start_date" not in request.form or "end_date" not in request.form or "lectures_per_week" not in request.form:
            return jsonify({"error": "Missing required inputs"}), 400

        # Get the uploaded file and form data
        file = request.files["file"]
        start_date = request.form["start_date"]
        end_date = request.form["end_date"]
        lectures_per_week = int(request.form["lectures_per_week"])

        # Save the file temporarily
        file_path = os.path.join("temp.pdf")
        file.save(file_path)

        # Extract text from the PDF
        syllabus_text = extract_text_from_pdf(file_path)

        # Clean up the temporary file
        os.remove(file_path)

        if not syllabus_text:
            return jsonify({"error": "Failed to extract text from PDF"}), 400

        # Structure the syllabus for timetable generation
        structured_syllabus = structure_syllabus_for_timetable(syllabus_text)
        # print(structured_syllabus)
        # Generate the timetable
        timetable = generate_timetable(structured_syllabus, start_date, end_date, lectures_per_week)
        # print(timetable)
        return jsonify({"timetable": timetable})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)