import React, { useState } from "react";
import axios from "axios";
import { FaPlus, FaTimes } from "react-icons/fa";
import {
  FormControlLabel,
  Checkbox,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { AddCircleOutline, Delete, DateRange } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const API = import.meta.env.VITE_BACKEND_URL;

const CreateQuiz = ({ onClose, classId }) => {
  const [quizName, setQuizName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [markPerQuestion, setMarkPerQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctoption: "" }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctoption = updatedQuestions[questionIndex].options[optionIndex];
    setQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${API}/quiz/createQuiz`, {
        classid:classId,
        quizname: quizName,
        startTime,
        duration: Number(duration),
        duedate: dueDate,
        markperquestion: Number(markPerQuestion),
        questionAnswerSet: questions,
      });
      setQuizName("");
      setStartTime(null);
      setDuration("");
      setDueDate(null);
      setMarkPerQuestion("");
      setQuestions([]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={5} sx={{ maxWidth: 600, margin: "auto", p: 4, borderRadius: 3, bgcolor: "#fefefe" }}>
      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: "center" }}>
        Create Quiz
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Quiz Name"
          fullWidth
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Start Time"
            value={startTime}
            onChange={setStartTime}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <DateRange />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>

        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <DateRange />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>

        <TextField
          label="Mark per Question"
          type="number"
          fullWidth
          value={markPerQuestion}
          onChange={(e) => setMarkPerQuestion(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
          Questions
        </Typography>
        {questions.map((question, qIndex) => (
          <Box key={qIndex} sx={{ p: 3, border: "1px solid #ddd", borderRadius: 3, mb: 3, bgcolor: "#fafafa" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Question {qIndex + 1}:</Typography>
              <IconButton color="error" onClick={() => handleRemoveQuestion(qIndex)}>
                <Delete />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              value={question.questionText}
              onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            {question.options.map((option, oIndex) => (
              <Box key={oIndex} display="flex" alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  value={option}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  required
                  sx={{ mr: 2 }}
                />
                <FormControlLabel
                  control={<Checkbox checked={question.correctoption === option} onChange={() => handleCorrectOptionChange(qIndex, oIndex)} />}
                  label="Correct"
                />
              </Box>
            ))}
          </Box>
        ))}
        <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleAddQuestion} fullWidth sx={{ mb: 3 }}>
          Add Question
        </Button>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Quiz"}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </form>
    </Paper>
  );
};

export default CreateQuiz;