import fitz
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import base64
import io
from pdf2image import convert_from_bytes
from PIL import Image
import re
import json
import os
import logging
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import requests
from dotenv import load_dotenv

from datetime import datetime, timedelta
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure APIs
EDENAI_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDE3YjgwYzAtNzg5ZS00YmZkLWIwOTUtMWViZGE0YjNjMjY0IiwidHlwZSI6ImFwaV90b2tlbiJ9.X6hlGB842uLh2-CWDGgmt60ucJE6gYF-pS8BS0_lvXs"
API_KEY = "AIzaSyCRPHBaZTUVv7EsYkBTDZnbOFCsrdmx7zE"
genai.configure(api_key=API_KEY)

# Configuration
DB_PATH = "chroma_db"
os.makedirs(DB_PATH, exist_ok=True)
SCORING_MODEL = genai.GenerativeModel('gemini-1.5-flash')

# Helper Functions
def image_to_base64(image):
    """Convert an image to base64."""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def extract_text_from_image(image):
    """Extract text from an image using Gemini."""
    try:
        img_base64 = image_to_base64(image)
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content([
            "Extract text exactly as written from this document. Preserve formatting and numbering.",
            {"mime_type": "image/png", "data": img_base64}
        ])
        return response.text.strip() if response else ""
    except Exception as e:
        logger.error(f"OCR Error: {e}")
        return f"OCR Error: {str(e)}"

def process_pdf(file):
    """Process a PDF file to extract text from images."""
    try:
        images = convert_from_bytes(file.read())
        extracted_text = ""
        for image in images:
            text = extract_text_from_image(image)
            extracted_text += text + "\n"
        file.seek(0)
        return extracted_text
    except Exception as e:
        logger.error(f"PDF Processing Error: {e}")
        return f"PDF Processing Error: {str(e)}"

def process_questions(text):
    """Process text to extract questions and answers."""
    questions = re.split(r'(?=Q\d+)', text)
    indices = []
    for q in questions:
        match = re.match(r'Q(\d+)', q)
        if match: indices.append(int(match.group(1)))
    
    if not indices: return []
    
    min_idx, max_idx = min(indices), max(indices)
    questions_list = [""] * (max_idx - min_idx + 1)
    
    for q in questions:
        match = re.match(r'Q(\d+)', q)
        if match:
            idx = int(match.group(1)) - min_idx
            if 0 <= idx < len(questions_list):
                questions_list[idx] = q[match.end():].strip()
    
    return questions_list

def load_pdf(pdf_path):
    """Load and split a PDF into pages."""
    pdf_loader = PyPDFLoader(pdf_path)
    return pdf_loader.load_and_split()

def create_or_load_db(pages):
    """Create or load a Chroma database from PDF text."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=750, chunk_overlap=50)
    context = "\n\n".join(str(p.page_content) for p in pages)
    texts = text_splitter.split_text(context)

    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)

    if os.path.exists(DB_PATH):
        logger.info("Loading existing ChromaDB...")
        vector_index = Chroma(persist_directory=DB_PATH, embedding_function=embeddings)
    else:
        logger.info("Creating new ChromaDB...")
        vector_index = Chroma.from_texts(texts, embeddings, persist_directory=DB_PATH)
        vector_index.persist()

    return vector_index

def get_chroma_context(query, k=3):
    """Retrieve context from ChromaDB."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)
    db = Chroma(persist_directory=DB_PATH, embedding_function=embeddings)
    return db.similarity_search(query, k=k)

def evaluate_answer(question, answer, context):
    """Evaluate an answer based on context."""
    try:
        prompt = f"""Evaluate the answer strictly based on the context. Follow these rules:
        1. Score 0-10 (10=exact match, 7-9=mostly correct, 5-6=partial, 0-4=wrong)
        2. Consider spelling and technical terms
        3. Return ONLY the score as a float
        
        Question: {question}
        Answer: {answer}
        Context: {context[:1500]}  # Limit context length
        
        Score: """
        
        response = SCORING_MODEL.generate_content(prompt)
        score = min(10, max(0, float(response.text.strip())))
        return round(score, 1)
    except Exception as e:
        logger.error(f"Scoring Error: {e}")
        return 0.0

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF using PyMuPDF."""
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

# Routes
# @app.route("/schedule", methods=["POST"])
# def upload_file():
#     """Generate a teaching schedule from a syllabus PDF."""
#     try:
#         if "file" not in request.files or "start_date" not in request.form or "end_date" not in request.form:
#             return jsonify({"error": "Missing required inputs"}), 400

#         file = request.files["file"]
#         start_date = request.form["start_date"]
#         end_date = request.form["end_date"]

#         # Save the file temporarily
#         file_path = os.path.join("temp.pdf")
#         file.save(file_path)

#         # Extract text from the PDF
#         syllabus_text = extract_text_from_pdf(file_path)
#         os.remove(file_path)  # Clean up the temporary file
#         print(syllabus_text)

#         if not syllabus_text:
#             return jsonify({"error": "Failed to extract text from PDF"}), 400

#         # Generate prompt for Gemini
#         prompt = f"""
#         Generate a structured teaching schedule in JSON format.
#         - Start Date: {start_date}
#         - End Date: {end_date}
#         - Syllabus: {syllabus_text}
#         Output JSON array with: "date", "day", "topic", "hours".
#         """

#         # Get AI response
#         model = genai.GenerativeModel("gemini-1.5-pro")
#         response = model.generate_content(prompt)
#         if not response.text:
#             return jsonify({"error": "No valid response from AI"}), 500

#         # Clean response and extract JSON
#         cleaned_response = re.sub(r"json|", "", response.text.strip())
#         print(cleaned_response)
#         json_match = re.search(r"(\{.\}|\[.\])", cleaned_response, re.DOTALL)
#         print(json_match)
#         if not json_match:
#             return jsonify({"error": "No JSON found in AI response"}), 500

#         # Parse JSON
#         schedule = json.loads(json_match.group(1))
#         return jsonify({"schedule": schedule})

#     except json.JSONDecodeError as e:
#         return jsonify({"error": f"Invalid JSON format: {str(e)}"}), 500
#     except Exception as e:
#         return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/get_student_score', methods=['POST'])
def evaluate_answers():
    try:
        answer_file = request.files.get('answersheet')
        question_file = request.files.get('question_paper')
        if not answer_file or not question_file:
            return jsonify({"error": "Missing PDF files"}), 400

        answer_text = process_pdf(answer_file)
        question_text = process_pdf(question_file)

        questions = process_questions(question_text)
        answers = process_questions(answer_text)
        if len(questions) != len(answers):
            return jsonify({"error": "Q/A count mismatch"}), 400

        create_or_load_db([question_text]).persist()

        results = []
        for idx, (q, a) in enumerate(zip(questions, answers)):
            try:
                context = [doc.page_content for doc in get_chroma_context(q)]
                score = evaluate_answer(q, a, "\n".join(context))
                
                results.append({
                    "question_no": idx+1,
                    "question": q,
                    "answer": a,
                    "context": context,
                    "score": score,
                    "max_score": 10.0
                })
            except Exception as e:
                logger.error(f"Error processing Q{idx+1}: {e}")
                results.append({
                    "question_no": idx+1,
                    "error": "Evaluation failed"
                })

        return jsonify({
            "total_score": sum(r.get('score', 0) for r in results),
            "results": results
        })

    except Exception as e:
        return jsonify({"error": f"System error: {str(e)}"}), 500

@app.route("/upload", methods=["POST"])
def upload_pdf():
    """Upload a PDF and store its embeddings."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    os.makedirs("uploads", exist_ok=True)
    pdf_path = os.path.join("uploads", file.filename)
    file.save(pdf_path)

    try:
        pages = load_pdf(pdf_path)
        create_or_load_db(pages)
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "PDF uploaded and stored in ChromaDB"}), 200

@app.route("/detect_ai", methods=["POST"])
def detect_ai():
    Plagchecker_API_URL = "https://api.edenai.run/v2/text/ai_detection"
    try:
        text = ""
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400

            if file.filename.endswith('.pdf'):
                images = convert_from_bytes(file.read())
                for image in images:
                    text += extract_text_from_image(image)
            else:
                image = Image.open(file)
                text = extract_text_from_image(image)
        else:
            data = request.json
            text = data.get("text", "")

        if not text:
            return jsonify({'error': 'No text extracted or provided'}), 400

        headers = {
            "authorization": f"Bearer {EDENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "providers": "winstonai",
            "text": text
        }

        response = requests.post(Plagchecker_API_URL, json=payload, headers=headers)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_feedback', methods=['POST'])
def generate_feedback():
    data = request.json
    results = data.get("results")

    if not results:
        return jsonify({"error": "Missing required fields"}), 400

    feedback_responses = []
    for result in results:
        question = result.get("question")
        student_response = result.get("answer")

        if not question or not student_response:
            continue

        prompt = f"""
        You are an AI that generates structured JSON responses for a personalized feedback system. 
        Given the student's response to a question, provide the following details in JSON format:

        - question: The question being answered.
        - context: The original response provided by the student.
        - answer: A simplified version of the response.
        - evaluation: A short assessment of the answer's accuracy and completeness.
        - feedback: Constructive feedback to improve the response.

        Ensure the JSON output follows this structure:
        {{
          "question": "{question}",
          "context": "{student_response}",
          "answer": "Provide a simplified version of the response here.",
          "evaluation": "Provide a short assessment here.",
          "feedback": "Provide constructive feedback here."
        }}
        """

        feedback = ask_gemini_internal(prompt, API_KEY)
        feedback_responses.append(feedback)

    return jsonify(feedback_responses)

def ask_gemini_internal(prompt, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)
    return clean_ai_response(response.text)

def clean_ai_response(ai_response):
    """Clean and extract a valid JSON object from AI-generated text."""
    try:
        cleaned_text = re.sub(r"json\n|\n", "", ai_response).strip()
        quiz_data = json.loads(cleaned_text)
        required_keys = {"question", "context", "answer", "evaluation", "feedback"}
        if not required_keys.issubset(quiz_data.keys()):
            return {"error": "Invalid JSON structure received from AI"}
        return quiz_data
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format received from AI"}

@app.route("/mipmap", methods=["POST"])
def mipmap_endpoint():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the file temporarily
        file_path = os.path.join("temp.pdf")
        file.save(file_path)

        # Extract text from the PDF
        text = extract_text_from_pdf(file_path)
        os.remove(file_path)  # Clean up the temporary file
        # print(text)
        if not text:
            return jsonify({"error": "Failed to extract text from PDF"}), 400

        # Generate Mipmap response
        response = ask_gemini_mipmap(text, API_KEY)
        print(response)
        return  response

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def ask_gemini_mipmap(prompt, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-pro")

    mipmap_prompt = f"""
    Extract key points from the following text and structure them in a hierarchical Mipmap format.

    *FORMAT STRICTLY LIKE THIS (NO EXTRA CHARACTERS):*

    # Main Topic
    - Brief introduction to the topic
    
    ## Subtopic 1
    - Overview of the subtopic
      - Key points related to this subtopic
      - Additional details if needed
    
    ### Nested Subtopic (Level 2)
    - Further breakdown of Subtopic 1
      - Important details or facts
      - Supporting arguments or examples
    
    ## Subtopic 2
    - Explanation of another key area
      - Step-by-step breakdown (if process-based)
      - Important aspects to consider

    *DO NOT ADD EXTRA TEXT OR SYMBOLS. ONLY RETURN FORMATTED MIPMAP STRUCTURE.*
    but omit the keywords like topic ,subtopic , main topic
    Text:
    {prompt}
    """

    response = model.generate_content(mipmap_prompt)
    if response and response.text:
        formatted_text = postprocess_mipmap_response(response.text)
        return formatted_text
    else:
        return "Error: No response received from Gemini API."

def postprocess_mipmap_response(response_text):
    """Postprocess the response from Gemini API to ensure it adheres to the Mipmap format."""
    cleaned_text = response_text.strip()
    if not cleaned_text.startswith("Mipmap"):
        cleaned_text = "Mipmap\n\n" + cleaned_text
    cleaned_text = re.sub(r'\\*Level (\d+):\\', r'\nLevel \1:*', cleaned_text)
    cleaned_text = re.sub(r'Key Points:\s*-', 'Key Points:\n-', cleaned_text)
    cleaned_text = re.sub(r'\n+', '\n', cleaned_text).strip()
    return cleaned_text


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
            full_schedule.extend(monthly_schedule)
        except Exception as e:
            print(f"Error generating schedule for {monthly_start} to {monthly_end}: {e}")
            raise

    return full_schedule

# Route for Generating Schedule
@app.route("/generate_schedule", methods=["POST"])
def generate_schedule():
    """Generate a teaching schedule from a PDF file."""
    try:
        # Check if the request contains a file and required form data
        if "file" not in request.files or "start_date" not in request.form or "end_date" not in request.form:
            return jsonify({"error": "Missing required inputs"}), 400

        # Get the uploaded file and form data
        file = request.files["file"]
        start_date = request.form["start_date"]
        end_date = request.form["end_date"]

        # Save the file temporarily
        file_path = os.path.join("temp.pdf")
        file.save(file_path)

        # Generate the full schedule
        schedule = generate_full_schedule(file_path, start_date, end_date)

        # Clean up the temporary file
        os.remove(file_path)

        # Return the schedule as JSON
        return jsonify({"schedule": schedule})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)