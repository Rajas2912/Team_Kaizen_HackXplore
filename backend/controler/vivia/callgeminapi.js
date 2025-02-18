import multer from "multer";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY:", GEMINI_API_KEY);

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in the environment variables.");
  process.exit(1); // Exit the process if the API key is missing
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Controller function for handling the Gemini API call
export const callgeminiapi = async (req, res) => {
  try {
    const { question, modelAnswer } = req.body;
    const audioFile = req.file; // Uploaded audio file

    // Check if the audio file is present
    if (!audioFile) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Step 1: Read the audio file as base64
    const audioData = fs.readFileSync(audioFile.path, { encoding: "base64" });

    // Step 2: Generate a transcript from the audio file
    const transcriptResponse = await model.generateContent([
      "Convert the following audio file into a transcript:",
      {
        inlineData: {
          mimeType: "audio/wav", // Change to "audio/mp3" if using MP3
          data: audioData, // Base64-encoded audio file
        },
      },
    ]);

    const userTranscript = transcriptResponse.response.text();

    // Step 3: Evaluate the transcript using the custom prompt
    const prompt = `
      You are a human scoring assistant. Evaluate the user's audio file transcript based on the following parameters:
      - Relevance (out of 10)
      - Completeness (out of 10)
      - Accuracy (out of 10)
      - Depth of Knowledge (out of 10)
      Also, calculate the total average score out of 10 as the final output.

      Model Answer: ${modelAnswer}
      User Answer: ${userTranscript}
    `;

    const evaluationResponse = await model.generateContent([prompt]);
    const evaluationResult = evaluationResponse.response.text();

    // Step 4: Clean up the uploaded file
    fs.unlinkSync(audioFile.path);

    // Step 5: Send the evaluation result back to the client
    res.json({
      transcript: userTranscript,
      evaluation: evaluationResult,
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to fetch response from Gemini API" });
  }
};