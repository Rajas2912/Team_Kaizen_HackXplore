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


{
  "lectures": [
    {
      "lecture_number": 1,
      "topics": [
        "Introduction to Computer Networks",
        "LAN, MAN, WAN, PAN, Ad hoc Networks"
      ]
    },
    {
      "lecture_number": 2,
      "topics": [
        "Network Architectures: Client-Server, Peer-to-Peer",
        "Network Topologies: Bus, Ring, Tree, Star, Mesh, Hybrid"
      ]
    },
    {
      "lecture_number": 3,
      "topics": [
        "Communication Models: OSI Model"
      ]
    },
    {
      "lecture_number": 4,
      "topics": [
        "Communication Models: TCP/IP Model",
        "Design Issues for Layers"
      ]
    },
    {
      "lecture_number": 5,
      "topics": [
        "Physical Layer: Transmission Media (Guided and Unguided)"
      ]
    },
    {
      "lecture_number": 6,
      "topics": [
        "Physical Layer: Transmission Modes (Simplex, Half Duplex, Full Duplex)"
      ]
    },
    {
      "lecture_number": 7,
      "topics": [
        "Physical Layer: Network Devices (Hub, Repeater, Bridge)"
      ]
    },
    {
      "lecture_number": 8,
      "topics": [
        "Physical Layer: Network Devices (Switch, Router, Gateway, Brouter)"
      ]
    },
    {
      "lecture_number": 9,
      "topics": [
        "Physical Layer: Spread Spectrum Signal, FHSS, DSSS"
      ]
    },
    {
      "lecture_number": 10,
      "topics": [
        "Data Link Layer: Logical Link Control (LLC) - Services, Framing"
      ]
    },
    {
      "lecture_number": 11,
      "topics": [
        "Data Link Layer: LLC - Framing Challenges and Types"
      ]
    },
    {
      "lecture_number": 12,
      "topics": [
        "Data Link Layer: LLC - Error Control, Parity Bits, Hamming Codes, CRC"
      ]
    },
    {
      "lecture_number": 13,
      "topics": [
        "Data Link Layer: Flow Control Protocols (Unrestricted Simplex, Stop and Wait, Sliding Window)"
      ]
    },
    {
      "lecture_number": 14,
      "topics": [
        "Data Link Layer: WAN Connectivity (PPP and HDLC)"
      ]
    },
    {
      "lecture_number": 15,
      "topics": [
        "Medium Access Control: Channel Allocation (Static and Dynamic)"
      ]
    },
    {
      "lecture_number": 16,
      "topics": [
        "Medium Access Control: Multiple Access Protocols (ALOHA, CSMA, WDMA)"
      ]
    },
    {
      "lecture_number": 17,
      "topics": [
        "Medium Access Control: IEEE 802.3 Standards and Frame Formats, CSMA/CD"
      ]
    },
    {
      "lecture_number": 18,
      "topics": [
        "Network Layer: Switching Techniques, IP Protocol, IPv4 and IPv6 Addressing"
      ]
    },
    {
      "lecture_number": 19,
      "topics": [
        "Network Layer: Subnetting, NAT, CIDR, ICMP"
      ]
    },
    {
      "lecture_number": 20,
      "topics": [
        "Network Layer: Routing Protocols (Distance Vector, Link State, Path Vector)"
      ]
    },
    {
      "lecture_number": 21,
      "topics": [
        "Network Layer: Routing in Internet (RIP, OSPF, BGP), Congestion Control, QoS"
      ]
    },
    {
      "lecture_number": 22,
      "topics": [
        "Transport Layer: Services, Berkeley Sockets, Addressing, Connection Establishment/Release"
      ]
    },
    {
      "lecture_number": 23,
      "topics": [
        "Transport Layer: Flow Control, Buffering, Multiplexing, TCP, TCP Timer Management, QoS, Differentiated Services, TCP/UDP for Wireless"
      ]
    },
    {
      "lecture_number": 24,
      "topics": [
        "Application Layer: DNS, HTTP, Email (SMTP, MIME, POP3, Webmail), FTP, TELNET"
      ]
    },
    {
      "lecture_number": 25,
      "topics": [
        "Application Layer: DHCP, SNMP"
      ]
    }
  ]
}




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
        print(syllabus_text)
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