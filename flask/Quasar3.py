import fitz
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
import google.generativeai as genai
import base64
import io
import cv2
import numpy as np
from datetime import datetime
# import fitz
from pdf2image import convert_from_bytes
from PIL import Image
import re
import json
import os
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure APIs
EDENAI_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDE3YjgwYzAtNzg5ZS00YmZkLWIwOTUtMWViZGE0YjNjMjY0IiwidHlwZSI6ImFwaV90b2tlbiJ9.X6hlGB842uLh2-CWDGgmt60ucJE6gYF-pS8BS0_lvXs"
API_KEY = "AIzaSyC1bnVlj3c5Ob56gXWgglUkM7xZI76SKsQ"
genai.configure(api_key=API_KEY)

# LMNT API key 
LMNT_API_KEY = "b41b2d1dd2494ca0a54dcf92f1a74474"
# Configuration
DB_PATH = "flask/chroma_db9"
os.makedirs(DB_PATH, exist_ok=True)
SCORING_MODEL = genai.GenerativeModel('gemini-1.5-flash')

# Helper Functions
def image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')


def extract_text_from_image(image):
    try:
        img_base64 = image_to_base64(image)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([
            "Extract text exactly as written from this document. Preserve formatting and numbering.",
            {"mime_type": "image/png", "data": img_base64}
        ])
        return response.text.strip() if response else ""
    except Exception as e:
        return f"OCR Error: {str(e)}"


def process_pdf(file):
    try:
        images = convert_from_bytes(file.read())
        extracted_text = ""
        for image in images:
            text = extract_text_from_image(image)
            extracted_text += text + "\n"
        file.seek(0)
        print(extracted_text + "hrllo")
        return extracted_text
    except Exception as e:
        return f"PDF Processing Error: {str(e)}"


def process_questions(text):
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
    """Loads and splits a PDF into pages."""
    pdf_loader = PyPDFLoader(pdf_path)
    pages = pdf_loader.load_and_split()
    print(pages)
    return pages


def create_or_load_db(pages):
    """Splits PDF text into smaller chunks and either creates or loads a persistent Chroma database."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=750, chunk_overlap=50)
    context = "\n\n".join(str(p.page_content) for p in pages)
    texts = text_splitter.split_text(context)

    # Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)

    # Check if ChromaDB already exists
    if os.path.exists(DB_PATH):
        print("Loading existing ChromaDB...")
        vector_index = Chroma(persist_directory=DB_PATH, embedding_function=embeddings)
    else:
        print("Creating new ChromaDB...")
        vector_index = Chroma.from_texts(texts, embeddings, persist_directory=DB_PATH)
        vector_index.persist()  # Save to disk
    return vector_index


def create_chroma_db(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    texts = text_splitter.split_text(text)

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=API_KEY
    )

    return Chroma.from_texts(
        texts,
        embeddings,
        persist_directory=DB_PATH
    )


def get_chroma_context(query, k=3):
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=API_KEY
    )
    db = Chroma(
        persist_directory=DB_PATH,
        embedding_function=embeddings
    )
    return db.similarity_search(query, k=k)


def evaluate_answer(question, answer, context):
    try:
        prompt = f"""
Evaluate the student's answer strictly based on the provided context and the following rules:

1. **Scoring Criteria**:
   - **10/10**: The answer is completely correct, matches the context exactly, and includes all relevant details.
   - **8-9/10**: The answer is mostly correct but may have minor inaccuracies or omissions.
   - **6-7/10**: The answer is partially correct but lacks important details or contains some inaccuracies.
   - **4-5/10**: The answer is somewhat relevant but contains significant inaccuracies or omissions.
   - **0-3/10**: The answer is incorrect, irrelevant, or does not address the question.

2. **Evaluation Guidelines**:
   - Consider the accuracy of the answer in relation to the context.
   - Check for the inclusion of key terms, concepts, and details from the context.
   - Deduct points for spelling errors, grammatical mistakes, or unclear phrasing.
   - Ensure the answer is concise and directly addresses the question.

3. **Output Format**:
   - Return ONLY the score as a float between 0 and 10.

**Question**: {question}
**Student's Answer**: {answer}
**Context**: {context[:1500]}  # Limit context length to avoid token overflow

**Score**: """

        response = SCORING_MODEL.generate_content(prompt)
        # print("\n")
        # print("niggg")
        print(context)
        # print("niggg")
        # print("\n")
        score = min(10, max(0, float(response.text.strip())))
        return round(score, 1)
    except Exception as e:
        print(f"Scoring Error: {str(e)}")
        return 0.0


def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()
def extract_text_from_pdf12(file):
    """
    Extracts text from a PDF file object.

    Args:
        file: A file-like object (e.g., from Flask's request.files).

    Returns:
        str: The extracted text from the PDF.
    """
    text = ""
    # Use BytesIO to read the file in memory
    with BytesIO(file.read()) as pdf_file:
        # Open the PDF file using PyMuPDF
        with fitz.open(stream=pdf_file, filetype="pdf") as doc:
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
        # print(response)

        if not response.text:
            return jsonify({"error": "No valid response from AI"}), 500

        cleaned_response = response.text.strip()
        # Clean response and extract JSON
        # cleaned_response = re.sub(r'json|', '', response.text)
        cleaned_response = re.sub(r"json|", "", cleaned_response).strip()
        json_match = re.search(r"(\{.\}|\[.\])", cleaned_response, re.DOTALL)
        print(cleaned_response)
        print(json_match)
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


# Routes
@app.route('/get_student_score', methods=['POST'])
def evaluate_answers():
    try:
        # File handling
        answer_file = request.files.get('answersheet')
        question_file = request.files.get('question_paper')
        if not answer_file or not question_file:
            return jsonify({"error": "Missing PDF files"}), 400

        # Text extraction
        answer_text = process_pdf(answer_file)
        # print(answer_text)
        question_text = process_pdf(question_file)
        # print(question_text)

        # Question-answer processing
        questions = process_questions(question_text)
        answers = process_questions(answer_text)
        if len(questions) != len(answers):
            return jsonify({"error": "Q/A count mismatch"}), 400

        # Create knowledge base
        # create_chroma_db(question_text).persist()

        # Evaluation pipeline
        results = []
        for idx, (q, a) in enumerate(zip(questions, answers)):
            try:
                context = [doc.page_content for doc in get_chroma_context(q)]
                print("Retrieved Context:", context)
                score = evaluate_answer(q, a, "\n".join(context))

                results.append({
                    "question_no": idx + 1,
                    "question": q,
                    "answer": a,
                    "context": context,
                    "score": score,
                    "max_score": 10.0
                })
            except Exception as e:
                print(f"Error processing Q{idx + 1}: {str(e)}")
                results.append({
                    "question_no": idx + 1,
                    "error": "Evaluation failed"
                })
        # print(results)
        print(sum(r.get('score', 0) for r in results))
        # print(results)
        return jsonify({
            "total_score": sum(r.get('score', 0) for r in results),

            "results": results
        })

    except Exception as e:
        return jsonify({"error": f"System error: {str(e)}"}), 500


@app.route("/upload", methods=["POST"])
def upload_pdf():
    """API endpoint to upload a PDF and store its embeddings."""
    if "file" not in request.files:
        print("No file found in request")  # Debugging log
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    print(f"Received file: {file.filename}")  # Debugging log

    # Ensure 'uploads' directory exists
    os.makedirs("uploads", exist_ok=True)

    pdf_path = os.path.join("uploads", file.filename)
    file.save(pdf_path)

    print(f"File saved at: {pdf_path}")  # Debugging log

    # Load PDF and extract text
    try:
        # Extract text from the PDF
        text = extract_text_from_pdf(pdf_path)
        if not text:
            return jsonify({"error": "Failed to extract text from PDF"}), 500

        # Create or update ChromaDB with the extracted text
        create_chroma_db(text)

        return jsonify({"message": "PDF uploaded and stored in ChromaDB"}), 200
    except Exception as e:
        print(f"Error processing PDF: {e}")  # Debugging log
        return jsonify({"error": str(e)}), 500



@app.route("/detect_ai", methods=["POST"])
def detect_ai():
    Plagchecker_API_URL = "https://api.edenai.run/v2/text/ai_detection"
    try:
        text = ""
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400

            poppler_path = 'C:/Program Files (x86)/poppler-24.08.0/Library/bin'  # Adjust if necessary
            if file.filename.endswith('.pdf'):
                images = convert_from_bytes(file.read(), poppler_path=poppler_path)
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


import re
import json
import google.generativeai as genai

import time

def ask_gemini_internal(prompt, api_key):
    """
    Calls Gemini API and returns a structured JSON response.

    Parameters:
    - prompt: The formatted prompt.
    - api_key: The API key for authentication.

    Returns:
    - JSON response in the required structure.
    """
    try:
        # Configure API
        genai.configure(api_key=api_key)

        # Initialize the model
        model = genai.GenerativeModel("gemini-1.5-pro")

        # Get response
        response = model.generate_content(prompt)

        # Process the AI response to ensure valid JSON
        structured_response = clean_ai_response(response.text)

        return structured_response
    except Exception as e:
        print("Error in ask_gemini_internal:", str(e))  # Debugging log
        time.sleep(10)  # Add a delay of 10 seconds before retrying
        return {"error": str(e)}

def clean_ai_response(ai_response):
    """
    Cleans and extracts a valid JSON object from AI-generated text.

    Args:
        ai_response (str): The raw response from AI.

    Returns:
        dict: A properly formatted JSON object.
    """
    try:
        # Remove unnecessary formatting (like json ... )
        cleaned_text = re.sub(r"json\n|\n", "", ai_response).strip()

        # Extract JSON from the response (handle cases where JSON is embedded in text)
        json_match = re.search(r"\{.*\}", cleaned_text, re.DOTALL)
        if not json_match:
            return {"error": "No JSON found in AI response"}

        json_str = json_match.group(0)

        # Parse JSON response
        quiz_data = json.loads(json_str)

        # Validate structure
        required_keys = {"question", "context", "answer", "evaluation", "feedback"}
        if not required_keys.issubset(quiz_data.keys()):
            return {"error": "Invalid JSON structure received from AI"}

        return quiz_data
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format received from AI"}
    except Exception as e:
        print("Error in clean_ai_response:", str(e))  # Debugging log
        return {"error": str(e)}


@app.route('/parsejson', methods=['POST'])
def parse_json():
    try:
        print("Received request to /parsejson")
        # Get the input string from the form data
        input_string = request.form.get('input_string')

        if not input_string:
            return jsonify({"error": "No input_string provided in form data"}), 400

        # Parse the input string into a JSON object
        parsed_json = json.loads(input_string)
        print(parsed_json)
        # Return the parsed JSON as a response
        return jsonify(parsed_json),200
    except Exception as e:
        # Handle errors gracefully
        return jsonify({"error": str(e)}), 400



@app.route('/generate-feedback', methods=['POST'])
def generate_feedback():
    """
    API endpoint to generate personalized feedback based on student responses.
    """
    try:
        data = request.json
        # print("Incoming data:", data)  # Debugging log

        results = data.get("results")

        if not results:
            return jsonify({"error": "Missing required fields"}), 400

        if not isinstance(results, list):
            return jsonify({"error": "Results must be an array"}), 400

        feedback_responses = [
            [{'question': 'What is the significance of Greek mythology in Western civilization?', 'context': 'Greek mythology has been instrumental in the development of Western civilization. It has had an impact on literature, art, philosophy, and culture. The myths of gods, heroes, and rituals formed the basis of most literary pieces, such as epics like The Iliad and The Odyssey. Greek myths have taught moral lessons, accounted for natural phenomena, and inspired artistic works over centuries.', 'answer': "Greek mythology significantly influenced Western civilization's literature, art, philosophy, and culture by providing moral lessons, explanations for natural events, and inspiration for artistic creations.", 'evaluation': 'Good answer: Covers key areas but could be more specific.', 'feedback': "Your answer effectively summarizes the broad influence of Greek mythology. To strengthen it further, provide specific examples.  For instance, mention how specific myths influenced philosophical concepts or how they're reflected in particular artworks.  You could also discuss the impact of specific gods or heroes on cultural values."}, {'question': '.What are the primary literary sources of Greek mythology?', 'context': "The principal literary sources of Greek mythology are: Homer's Iliad and The Odyssey, which tell of the Trojan War and the journey of Odysseus. Hesiod's Theogony and Works and Days, which recount the creation of the gods and offer practical information on living. The Homeric Hymns, which recount the myths of different gods. Tragic dramas by Aeschylus, Sophocles, and Euripides that retain different myths.", 'answer': "The main sources for Greek myths are Homer's epics (Iliad and Odyssey), Hesiod's works (Theogony and Works and Days), the Homeric Hymns, and plays by Aeschylus, Sophocles, and Euripides.", 'evaluation': 'Good answer: Covers the key sources.', 'feedback': "Your answer is comprehensive and effectively summarizes the primary literary sources.  To further strengthen it, you might consider briefly explaining the specific focus of each source (e.g., Homer's focus on heroes, Hesiod's on the origins of the gods, the tragedians' exploration of moral and philosophical themes through myths).  This added context would provide a richer understanding of the variety and depth within Greek mythological literature."}, {'question': 'How did Greek mythology explain the creation of the world?', 'context': "The world, as per Hesiod's Theogony, started with Chaos, and then Gaea (Earth), Tartarus (the Abyss), and Eros (Love) appeared. Gaea bore Uranus (Heaven), who was her consort. Their offspring were the Titans, the Cyclopes, and other gods. The division of Gaea and Uranus by their son Cronus initiated divine succession and power struggles.", 'answer': "Greek mythology explains the world's creation as starting from Chaos, followed by Earth (Gaea), the Abyss (Tartarus), and Love (Eros). Gaea and Uranus (Heaven) then gave birth to the Titans, Cyclopes, and other gods, leading to power struggles and divine succession.", 'evaluation': 'Good overview: Captures the main points.', 'feedback': "Your summary provides a good overview of the creation myth.  To make it even stronger, you could briefly mention the significance of Cronus's actions in overthrowing Uranus. This act of rebellion is key to understanding the subsequent power struggles among the gods.  Consider also mentioning the Muses, as they are often invoked in Greek mythology as the source of inspiration for poets and storytellers recounting these creation myths."}, {'question': '.What role did Zeus play in Greek mythology?', 'context': 'Zeus was the king of gods and lord of Mount Olympus. He was the sky god, god of thunder, and god of justice. Zeus became the ruler of gods after defeating his father Cronus. Zeus imposed order among gods. Zeus was involved in most of the myths, such as punishing Prometheus, his relationships with mortal women, and acting as an arbiter between other gods.', 'answer': 'Zeus was the king of the Greek gods, ruling from Mount Olympus. He oversaw the sky, thunder, and justice. He overthrew his father, Cronus, to become ruler and established order among the gods. He played a central role in many myths.', 'evaluation': 'Good overview, but lacks specific examples.', 'feedback': "Your answer provides a good general overview of Zeus's role.  To make it stronger, include specific examples of his influence in Greek mythology, such as his punishment of Prometheus for giving fire to humans, or his intervention in the Trojan War.  Mentioning these details will demonstrate a deeper understanding of his importance and impact."}, {'question': '.What are the different types of myths in Greek culture?', 'context': "Greek myths are divided into three broad categories: Religious Myths: Describing the origin of gods and rituals (e.g., Zeus's dominance). Legends: Half-historical accounts of heroes such as Heracles and Perseus. Folktales: Common stories with moral teachings, e.g., the exploits of Odysseus.", 'answer': 'Greek myths are categorized into Religious Myths (origin of gods and rituals), Legends (stories of heroes), and Folktales (moral stories).', 'evaluation': 'Accurate and complete.', 'feedback': 'Your answer is concise and accurately covers the main categories of Greek myths.  To further enhance your answer, you could provide a brief explanation of the key differences between legends and folktales.  For example, you could mention that legends often involve interaction with the divine while folktales are more grounded in everyday human experience. You could also provide additional examples for each category to illustrate their defining features.'}, {'question': '.How did the Greeks perceive their gods?', 'context': 'The Greeks considered their gods to be anthropomorphic (human form and feelings). The Greeks believed the gods shared both divine abilities and human weakness, like jealousy, anger, and love. The gods communicated with humans frequently, helping or punishing them in accordance with their deeds.', 'answer': 'The Greeks saw their gods as human-like in form and emotion, possessing both great power and human flaws.  They believed the gods interacted with humans, rewarding or punishing them based on their actions.', 'evaluation': 'Good answer: Accurately summarizes the key aspects.', 'feedback': 'This is a good summary of the Greek perception of gods. To further enhance your answer, you could provide specific examples of gods and their associated traits or stories that illustrate these characteristics. You could also discuss the role of oracles and temples in facilitating communication between gods and humans.'}, {'question': '.What was the myth of Prometheus, and what does it symbolize?', 'context': 'Prometheus was a Titan who went against Zeus by stealing fire from the gods and presenting it to humankind. Zeus punished him by tying him to a rock where his liver was consumed daily by an eagle. The myth represents human progress, seeking knowledge, and punishment for challenging godly power.', 'answer': "Prometheus stole fire from the gods for humans and was punished eternally by Zeus. This symbolizes humanity's pursuit of knowledge and the consequences of defying divine authority.", 'evaluation': 'Good answer: Accurately summarizes the myth and its symbolism.', 'feedback': "Your answer is concise and captures the key elements of the myth.  To further enhance it, you could mention the specific type of knowledge fire represents (technology, enlightenment) and perhaps elaborate slightly on the nature of Prometheus's defiance  it wasn't simply disobedience, but an act of compassion for humanity.  Overall, a solid response!"}, {'question': 'How did Greek myths explain natural phenomena?', 'context': "Greek myths tended to attribute natural phenomena to gods and heroes. For instance:Helios's chariot ride across the sky accounted for the sun's daily path. Persephone's stay in the underworld symbolized the seasons.Zeus's thunderbolts were thought to bring storms.", 'answer': "Greek myths explained natural events by attributing them to the actions of gods and goddesses, such as Helios's sun chariot, Persephone's descent to the underworld, and Zeus's thunderbolts.", 'evaluation': 'Good answer: Covers key examples and the general principle.', 'feedback': 'Your answer effectively summarizes the explanation and provides strong examples.  To further enhance it, you could consider mentioning a wider variety of natural phenomena covered by Greek myths, like the creation of the world or the origin of certain plants or animals.  Exploring the cultural significance of these explanations could also add depth.'}, {'question': 'What is the significance of the Trojan War in Greek mythology?', 'context': 'The Trojan War, as portrayed in The Iliad, was a significant mythological event. It was brought about by the kidnapping of Helen by Paris and saw a host of popular heroes such as Achilles, Hector, and Odysseus. The war was representative of the battle between fate and free will and engaged in issues of honor, heroism, and divine intervention.', 'answer': "The Trojan War, a key event in Greek mythology, stemmed from Helen's abduction by Paris, showcasing heroes like Achilles and Odysseus, and exploring themes of fate, free will, honor, and divine influence.", 'evaluation': 'Good overview, but could be more specific.', 'feedback': "This is a good summary of the Trojan War's significance.  To improve, consider providing specific examples of how the war demonstrated these themes. For example, you could mention Achilles' struggle with fate or Odysseus's reliance on his wit to overcome obstacles.  Briefly mentioning the war's impact on later Greek literature and thought would also strengthen your answer."}, {'question': '.What lessons did Greek mythology teach about human nature and morality?', 'context': 'Greek myths taught significant moral lessons, including: The risks of hubris (excessive pride), as illustrated in the myths of Icarus and Niobe. The value of hospitality, as illustrated in the myth of Baucis and Philemon. The repercussions of disobeying the gods, as illustrated by Prometheus and Pandora.', 'answer': 'Greek mythology taught lessons about the dangers of hubris (excessive pride), the importance of hospitality, and the consequences of disobeying the gods.', 'evaluation': 'Good answer: Covers key themes with supporting examples.', 'feedback': "Your answer effectively summarizes the key moral lessons from Greek mythology and provides relevant examples.  To further strengthen your response, you could briefly explain how the examples illustrate the lessons. For example, you could mention how Icarus's defiance of his father and the limitations of his wax wings led to his downfall, demonstrating the danger of hubris. Similarly, explaining how Zeus punished Prometheus for giving fire to humans would illustrate the consequences of disobeying the gods."}]
        ]

        # for result in results:
        #     if not isinstance(result, dict):
        #         continue

        #     question = result.get("question")
        #     student_response = result.get("answer")

        #     if not question or not student_response:
        #         continue

        #     # Construct prompt for AI
        #     prompt = f"""
        #     You are an AI that generates structured JSON responses for a personalized feedback system. 
        #     Given the student's response to a question, provide the following details in JSON format:

        #     - question: The question being answered.
        #     - context: The original response provided by the student.
        #     - answer: A simplified version of the response.
        #     - evaluation: A short assessment of the answer's accuracy and completeness.
        #     - feedback: Constructive feedback to improve the response.

        #     eg - 

        #         question - What were the major causes of World War I?
        #         context -  World War I was caused by a combination of political tensions, military buildup, and nationalistic sentiments.
        #         answer - World War I started because of political tensions between nations and various alliances.
        #         evaluation - Partial answer: Needs more depth.
        #         feedback - You've identified alliances as a cause, which is a good start! However, your response could be more detailed. Try elaborating on specific alliances and other contributing factors like militarism, imperialism, and nationalism.

        #     Ensure the JSON output follows this structure:
        #     {{
        #       "question": "{question}",
        #       "context": "{student_response}",
        #       "answer": "Provide a simplified version of the response here.",
        #       "evaluation": "Provide a short assessment here.",
        #       "feedback": "Provide constructive feedback here."
        #     }}
        #     """

        #     # Get feedback from Gemini
        #     feedback = ask_gemini_internal(prompt, API_KEY)
        #     # print("Raw AI response:", feedback)  # Debugging log
        #     time.sleep(8)
        #     # Check for errors in the AI response
        #     if "error" in feedback:
        #         feedback_responses.append(feedback)
        #     else:
        #         feedback_responses.append(feedback)

        #     # Add a delay between API calls (e.g., 5 seconds)

        #     time.sleep(10)
        print(feedback_responses)
        return jsonify(feedback_responses)
    except Exception as e:
        print("Error in generate_feedback:", str(e))  # Debugging log
        return jsonify({"error": str(e)}), 500
    
def postprocess_mipmap_response(response_text):
    """
    Postprocesses the response from Gemini API to ensure it adheres to the Mipmap format.
    """
    # Remove any unwanted characters or extra spaces
    cleaned_text = response_text.strip()

    # Ensure the response starts with "Mipmap" and has the correct hierarchical structure
    if not cleaned_text.startswith("Mipmap"):
        cleaned_text = "Mipmap\n\n" + cleaned_text

    # Use regex to ensure proper formatting of levels and key points
    cleaned_text = re.sub(r'\\*Level (\d+):\\', r'\nLevel \1:*', cleaned_text)
    cleaned_text = re.sub(r'Key Points:\s*-', 'Key Points:\n-', cleaned_text)

    # Remove any extra newlines or spaces
    cleaned_text = re.sub(r'\n+', '\n', cleaned_text).strip()

    return cleaned_text

def ask_gemini_mipmap(prompt, api_key):
    """
    Calls Gemini API and returns a properly structured Mipmap response.
    """
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
        # Postprocess the response to ensure proper formatting
        formatted_text = postprocess_mipmap_response(response.text)
        return formatted_text
    else:
        return "Error: No response received from Gemini API."

@app.route("/mipmap", methods=["POST"])
def mipmap_endpoint():
    """
    Flask API endpoint to process text from form-data and return a structured Mipmap response.
    """
    try:
        # Check if a file is uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']


        # Extract text from the PDF
        text = extract_text_from_pdf12(file)


            # Process the extracted text
        response = ask_gemini_mipmap(text, API_KEY)

        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#######
# for text too  speech
# Function to generate speech from text
def generate_speech(text, voice_id="d2b864ea-e642-4196-9b24-d8a928523a2b", model="blizzard", language="en",
                    format="mp3", sample_rate="16000", speed="1.0"):
    url = "https://api.lmnt.com/v1/ai/speech/bytes"

    payload = {
        "voice": voice_id,
        "text": text,
        "model": model,
        "language": language,
        "format": format,
        "sample_rate": sample_rate,
    }

    headers = {
        "X-API-Key": LMNT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(url, data=payload, headers=headers)

    if response.status_code == 200:
        # Convert raw audio bytes to Base64
        audio_base64 = base64.b64encode(response.content).decode("utf-8")
        return audio_base64
    else:
        return None


@app.route("/generate_speech", methods=["POST"])
def generate_speech_api():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "Text parameter is required"}), 400

    result = generate_speech(text)
    if result:
        print(result)
        return jsonify({"speech": result})
    else:
        return jsonify({"error": "Failed to generate speech"}), 500
#######


@app.route('/api/capture-face', methods=['POST'])
def capture_face():
    try:
        data = request.json
        image_data = data['image'].split(',')[1]  # Remove data URL prefix
        student_id = data['studentId']
        count = data['count']
        
        # Create folder for student if it doesn't exist
        output_folder = os.path.join('images', student_id)
        os.makedirs(output_folder, exist_ok=True)
        
        # Decode and save image
        img_bytes = base64.b64decode(image_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        # Convert to grayscale and detect face
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier('flask/haarcascades/haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return jsonify({'success': False, 'message': 'No face detected'}), 400
        
        # Save the face image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"face_{timestamp}_{count}.jpg"
        filepath = os.path.join(output_folder, filename)
        cv2.imwrite(filepath, gray)
        
        return jsonify({'success': True, 'message': 'Face captured successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


researchmodel = genai.GenerativeModel('gemini-1.5-pro')
@app.route('/research', methods=['POST'])
def get_research_details():
    query = request.json.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        prompt = f"""
        For the research topic: '{query}', provide:
        1. 3 relevant papers with:
           - Title
           - Authors (as array)
           - DOI/URL
           - 50-word summary
        2. Overall 100-word literature review
        
        Return STRICT JSON format (no Markdown):
        {{
          "papers": [
            {{
              "title": "...",
              "authors": ["..."],
              "url": "...",
              "summary": "..."
            }}
          ],
          "overview": "..."
        }}
        """
        
        response = researchmodel.generate_content(prompt)
        json_str = re.search(r'{.*}', response.text, re.DOTALL).group(0)
        return jsonify(json.loads(json_str))
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)