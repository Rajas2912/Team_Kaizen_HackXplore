import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  Quiz as QuizIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

const API = import.meta.env.VITE_BACKEND_URL

const CreateViva = ({ onClose, classId }) => {
  const theme = useTheme();
  const [vivaName, setVivaName] = useState('');
  const [timeOfThinking, setTimeOfThinking] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questionAnswerSet, setQuestionAnswerSet] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numberOfQuestionsToAsk, setNumberOfQuestionsToAsk] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = parsedData
        .map((row) => ({
          questionText: row.Question || row['question'],
          answer: row.Answer || row['answer'],
        }))
        .filter((q) => q.questionText && q.answer);

      setQuestionAnswerSet(formattedData);
      setTotalQuestions(formattedData.length);
    };
    reader.readAsBinaryString(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setQuestionAnswerSet([]);
    setTotalQuestions(0);
    document.getElementById('fileInput').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
        numberOfQuestionsToAsk: Number(numberOfQuestionsToAsk),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create viva');
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
      <Card elevation={4} sx={{
        width: '100%',
        maxWidth: 600,
        p: 4,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.primary.main
          }}>
            <QuizIcon fontSize="large" />
            Create New Viva
          </Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
            mb: 3
          }}>
            <TextField
              label="Viva Name"
              variant="outlined"
              fullWidth
              value={vivaName}
              onChange={(e) => setVivaName(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuizIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Thinking Time (seconds)"
              variant="outlined"
              type="number"
              fullWidth
              value={timeOfThinking}
              onChange={(e) => setTimeOfThinking(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TimerIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Due Date"
              variant="outlined"
              type="date"
              fullWidth
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Questions to Ask"
              variant="outlined"
              type="number"
              fullWidth
              value={numberOfQuestionsToAsk}
              onChange={(e) => setNumberOfQuestionsToAsk(e.target.value)}
              required
              inputProps={{ min: 1, max: totalQuestions }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* File Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Upload Questions
            </Typography>
            
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              id="fileInput"
              hidden
            />
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{
                height: 56,
                borderStyle: 'dashed',
                borderWidth: 2,
                backgroundColor: selectedFile ? theme.palette.success.light : 'transparent'
              }}
            >
              {selectedFile ? 'File Uploaded' : 'Select Excel/CSV File'}
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>

            {selectedFile && (
              <Box sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                backgroundColor: theme.palette.grey[100],
                borderRadius: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileIcon color="primary" />
                  <Typography variant="body1">{selectedFile}</Typography>
                </Box>
                <IconButton onClick={handleRemoveFile} color="error">
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            <Box sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary">
                File should contain 'Question' and 'Answer' columns
              </Typography>
              <Chip 
                label={`${totalQuestions} questions found`} 
                color={totalQuestions > 0 ? "success" : "default"} 
                variant="outlined"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isLoading}
              sx={{ width: 120 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || totalQuestions === 0}
              sx={{ width: 180 }}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Creating..." : "Create Viva"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default CreateViva;
