from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import google.generativeai as genai  

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

if __name__ == "__main__":
    app.run(debug=True)