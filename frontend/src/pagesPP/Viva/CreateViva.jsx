import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { FaUpload, FaTimes } from "react-icons/fa";
import "./CreateViva.css";

const API = import.meta.env.VITE_BACKEND_URL;

const CreateViva = ({ onClose, classId }) => {
  const [vivaName, setVivaName] = useState("");
  const [timeOfThinking, setTimeOfThinking] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questionAnswerSet, setQuestionAnswerSet] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numberOfQuestionsToAsk, setNumberOfQuestionsToAsk] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = parsedData
        .map((row) => ({
          questionText: row.Question || row["question"],
          answer: row.Answer || row["answer"],
        }))
        .filter((q) => q.questionText && q.answer);

      setQuestionAnswerSet(formattedData);
      setTotalQuestions(formattedData.length); // Update total number of questions
    };
    reader.readAsBinaryString(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setQuestionAnswerSet([]);
    setTotalQuestions(0); // Reset total questions
    document.getElementById("fileInput").value = ""; // Clear input field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate number of questions to ask
    if (numberOfQuestionsToAsk > totalQuestions) {
      setError(
        `Number of questions to ask (${numberOfQuestionsToAsk}) cannot be greater than total questions (${totalQuestions}).`
      );
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/viva/createViva`, {
        classid: classId,
        vivaname: vivaName,
        timeofthinking: Number(timeOfThinking),
        duedate: dueDate,
        questionAnswerSet,
        numberOfQuestionsToAsk: Number(numberOfQuestionsToAsk), // Add this field
      });
      setVivaName("");
      setTimeOfThinking("");
      setDueDate("");
      setQuestionAnswerSet([]);
      setSelectedFile(null);
      setNumberOfQuestionsToAsk("");
      setTotalQuestions(0);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create viva");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-viva-container">
      <h2>Create Viva</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Viva Name:</label>
          <input
            type="text"
            value={vivaName}
            onChange={(e) => setVivaName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Time of Thinking (seconds):</label>
          <input
            type="number"
            value={timeOfThinking}
            onChange={(e) => setTimeOfThinking(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Number of Questions to Ask:</label>
          <input
            type="number"
            value={numberOfQuestionsToAsk}
            onChange={(e) => setNumberOfQuestionsToAsk(e.target.value)}
            required
            min="1"
            max={totalQuestions} // Ensure it doesn't exceed total questions
          />
          <small>
            Total Questions in Uploaded File: {totalQuestions}
          </small>
        </div>
        {/* Upload File Button */}
        <div className="upload-container">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            id="fileInput"
            hidden
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => document.getElementById("fileInput").click()}
            disabled={!!selectedFile}
          >
            <FaUpload className="upload-icon" /> Upload File
          </button>
          {selectedFile && (
            <div className="file-info">
              <p className="file-name">📁 {selectedFile}</p>
              <button
                type="button"
                className="remove-btn"
                onClick={handleRemoveFile}
              >
                <FaTimes className="remove-icon" /> Remove
              </button>
            </div>
          )}
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Viva"}
        </button>
        {error && <p className="error-message">Error: {error}</p>}
      </form>
    </div>
  );
};

export default CreateViva;