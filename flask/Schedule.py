import os
import json
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Configure APIs
API_KEY = "AIzaSyCRPHBaZTUVv7EsYkBTDZnbOFCsrdmx7zE"
genai.configure(api_key=API_KEY)

# Configuration
DB_PATH = "chroma_db"
os.makedirs(DB_PATH, exist_ok=True)
SCORING_MODEL = genai.GenerativeModel('gemini-1.5-pro')

# Helper Functions
def extract_text_from_pdf(pdf_path):
    import fitz  # PyMuPDF
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

def calculate_monthly_intervals(start_date, end_date):
    """Calculate monthly intervals between start_date and end_date."""
    intervals = []
    current_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    while current_date < end_date:
        next_date = current_date + timedelta(days=30)  # Approximate 1 month
        if next_date > end_date:
            next_date = end_date
        intervals.append((current_date.strftime("%Y-%m-%d"), next_date.strftime("%Y-%m-%d")))
        current_date = next_date + timedelta(days=1)  # Move to the next day

    return intervals

def generate_monthly_schedule(start_date, end_date, syllabus_text):
    """Generate a schedule for a specific date range using Gemini."""
    prompt = f"""
    Generate a structured teaching schedule in JSON format for the following syllabus:
    - Start Date: {start_date}
    - End Date: {end_date}
    - Syllabus: {syllabus_text}

    **Instructions:**
    1. Output must be a valid JSON array.
    2. Each item in the array should have the following keys:
       - "date" (format: YYYY-MM-DD)
       - "day" (e.g., Monday, Tuesday)
       - "topic" (a brief description of the topic)
       - "hours" (number of hours for the topic, e.g., 2)

    Example:
    [
        {{
            "date": "2023-10-01",
            "day": "Monday",
            "topic": "Introduction to Python",
            "hours": 2
        }},
        {{
            "date": "2023-10-02",
            "day": "Tuesday",
            "topic": "Data Types and Variables",
            "hours": 2
        }}
    ]

    **Important:**
    - Do not include any additional text or explanations.
    - Ensure the output is a valid JSON array.
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

def generate_full_schedule(pdf_path, start_date, end_date):
    """Generate a full teaching schedule in monthly chunks."""
    # Extract text from the PDF
    syllabus_text = extract_text_from_pdf(pdf_path)
    if not syllabus_text:
        raise ValueError("Failed to extract text from PDF")

    # Calculate monthly intervals
    intervals = calculate_monthly_intervals(start_date, end_date)

    # Generate schedule for each month
    full_schedule = []
    for interval in intervals:
        monthly_start, monthly_end = interval
        try:
            monthly_schedule = generate_monthly_schedule(monthly_start, monthly_end, syllabus_text)
            print(monthly_schedule)
            full_schedule.extend(monthly_schedule)
        except Exception as e:
            print(f"Error generating schedule for {monthly_start} to {monthly_end}: {e}")
            raise

    return full_schedule

# Main Function for Testing
if __name__ == "__main__":
    pdf_path = "./test.pdf"  # Replace with the path to your PDF file
    start_date = "2025-02-01"  # Replace with your start date
    end_date = "2025-05-30"  # Replace with your end date

    try:
        # Generate the full schedule
        schedule = generate_full_schedule(pdf_path, start_date, end_date)

        # Save the schedule to a JSON file
        with open("schedule2.json", "w") as f:
            json.dump(schedule, f, indent=4)

        print("Schedule generated successfully! Saved to 'schedule2.json'.")
        print(json.dumps(schedule, indent=4))  # Print the schedule to the console

    except Exception as e:
        print(f"Error: {e}")