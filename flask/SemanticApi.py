from flask import Flask, request, jsonify
import google.generativeai as genai
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app)
API_KEY = "AIzaSyC1bnVlj3c5Ob56gXWgglUkM7xZI76SKsQ"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

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
        
        response = model.generate_content(prompt)
        json_str = re.search(r'{.*}', response.text, re.DOTALL).group(0)
        return jsonify(json.loads(json_str))
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)