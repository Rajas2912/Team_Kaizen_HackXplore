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
} from '@mui/material'
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material'

const API = import.meta.env.VITE_BACKEND_URL

const CreateViva = ({ onClose, classId }) => {
  const [vivaName, setVivaName] = useState('')
  const [timeOfThinking, setTimeOfThinking] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [questionAnswerSet, setQuestionAnswerSet] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [numberOfQuestionsToAsk, setNumberOfQuestionsToAsk] = useState('')
  const [totalQuestions, setTotalQuestions] = useState(0)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    setSelectedFile(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const binaryString = e.target.result
      const workbook = XLSX.read(binaryString, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const parsedData = XLSX.utils.sheet_to_json(sheet)

      const formattedData = parsedData
        .map((row) => ({
          questionText: row.Question || row['question'],
          answer: row.Answer || row['answer'],
        }))
        .filter((q) => q.questionText && q.answer)

      setQuestionAnswerSet(formattedData)
      setTotalQuestions(formattedData.length)
    }
    reader.readAsBinaryString(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setQuestionAnswerSet([])
    setTotalQuestions(0)
    document.getElementById('fileInput').value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (numberOfQuestionsToAsk > totalQuestions) {
      setError(
        `Number of questions to ask (${numberOfQuestionsToAsk}) cannot be greater than total questions (${totalQuestions}).`
      )
      setIsLoading(false)
      return
    }

    try {
      await axios.post(`${API}/viva/createViva`, {
        classid: classId,
        vivaname: vivaName,
        timeofthinking: Number(timeOfThinking),
        duedate: dueDate,
        questionAnswerSet,
        numberOfQuestionsToAsk: Number(numberOfQuestionsToAsk),
      })
      setVivaName('')
      setTimeOfThinking('')
      setDueDate('')
      setQuestionAnswerSet([])
      setSelectedFile(null)
      setNumberOfQuestionsToAsk('')
      setTotalQuestions(0)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create viva')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Paper
      sx={{
        maxWidth: 500,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Create Viva
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Viva Name"
          value={vivaName}
          onChange={(e) => setVivaName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Time of Thinking (seconds)"
          type="number"
          value={timeOfThinking}
          onChange={(e) => setTimeOfThinking(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Number of Questions to Ask"
          type="number"
          value={numberOfQuestionsToAsk}
          onChange={(e) => setNumberOfQuestionsToAsk(e.target.value)}
          required
          inputProps={{ min: 1, max: totalQuestions }}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ mb: 2 }}>
          Total Questions in Uploaded File: {totalQuestions}
        </Typography>

        {/* File Upload Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            id="fileInput"
            hidden
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            disabled={!!selectedFile}
            sx={{ width: 200, height: 50 }}
          >
            Upload File
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          {selectedFile && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                📁 {selectedFile}
              </Typography>
              <IconButton size="small" onClick={handleRemoveFile}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create Viva'}
        </Button>

        {/* Error Message */}
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default CreateViva
