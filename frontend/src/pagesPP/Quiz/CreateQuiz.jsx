import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  CheckCircle as CorrectIcon,
  RadioButtonUnchecked as IncorrectIcon
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useTheme } from "@mui/material/styles";

const API = import.meta.env.VITE_BACKEND_URL;

const CreateQuiz = ({ onClose, classId }) => {
  const theme = useTheme();
  const [quizName, setQuizName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [markPerQuestion, setMarkPerQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      questionText: "", 
      options: ["", "", "", ""], 
      correctoption: "" 
    }]);
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
    updatedQuestions[questionIndex].correctoption = 
      updatedQuestions[questionIndex].options[optionIndex];
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
        classid: classId,
        quizname: quizName,
        startTime,
        duration: Number(duration),
        duedate: dueDate,
        markperquestion: Number(markPerQuestion),
        questionAnswerSet: questions,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      p: 3,
      backgroundColor: theme.palette.grey[100]
    }}>
      <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: 800,
        p: 4,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Create New Quiz
          </Typography>
          <IconButton onClick={onClose} size="large">
            <DeleteIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 4
          }}>
            <TextField
              label="Quiz Name"
              variant="outlined"
              fullWidth
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              required
            />

            <TextField
              label="Duration (minutes)"
              type="number"
              variant="outlined"
              fullWidth
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2">mins</Typography>
                  </InputAdornment>
                ),
              }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Due Date"
                value={dueDate}
                onChange={setDueDate}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              label="Marks per Question"
              type="number"
              variant="outlined"
              fullWidth
              value={markPerQuestion}
              onChange={(e) => setMarkPerQuestion(e.target.value)}
              required
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" fontWeight="bold">
                Questions ({questions.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                sx={{
                  backgroundColor: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark
                  }
                }}
              >
                Add Question
              </Button>
            </Box>

            {questions.length === 0 ? (
              <Paper elevation={0} sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: theme.palette.grey[100],
                borderRadius: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  No questions added yet. Click "Add Question" to get started.
                </Typography>
              </Paper>
            ) : (
              questions.map((question, qIndex) => (
                <Paper
                  key={qIndex}
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Chip
                      label={`Question ${qIndex + 1}`}
                      color="primary"
                      size="small"
                    />
                    <IconButton
                      onClick={() => handleRemoveQuestion(qIndex)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <TextField
                    label="Question Text"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                    required
                    sx={{ mb: 3 }}
                  />

                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Options (Select the correct one):
                  </Typography>

                  {question.options.map((option, oIndex) => (
                    <Box
                      key={oIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: question.correctoption === option 
                          ? theme.palette.success.light 
                          : 'transparent',
                        transition: 'background-color 0.3s'
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        required
                        sx={{ mr: 2 }}
                      />
                      <IconButton
                        onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                        color={question.correctoption === option ? "success" : "default"}
                      >
                        {question.correctoption === option ? (
                          <CorrectIcon />
                        ) : (
                          <IncorrectIcon />
                        )}
                      </IconButton>
                    </Box>
                  ))}
                </Paper>
              ))
            )}
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            mt: 4
          }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || questions.length === 0}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateQuiz;