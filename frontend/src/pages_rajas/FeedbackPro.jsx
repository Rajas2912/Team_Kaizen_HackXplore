import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  CircularProgress, 
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  Avatar,
  Stack,
  Snackbar
} from "@mui/material";
import { 
  Feedback as FeedbackIcon,
  Error as ErrorIcon,
  QuestionAnswer as QAIcon,
  CheckCircle as CheckIcon,
  Lightbulb as TipIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useGetSubmissionResultQuery } from "../redux/api/assignmentSlice";

const FeedbackPro = () => {
  const location = useLocation();
  const { studentId, assignmentId } = location.state || {};
  const theme = useTheme();
  const [feedbackData, setFeedbackData] = useState([]);
  const [storedFeedback, setStoredFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { data: resultData, error: resultError, isLoading: resultLoading, refetch: refetchResult } = 
    useGetSubmissionResultQuery({ assignmentId, studentId });

  // Check for stored feedback first
  const checkForStoredFeedback = async () => {
    try {
      const response = await fetch(`http://localhost:4001/assignment/feedback/${assignmentId}/${studentId}`);
      // console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch stored feedback');
      }
      const data = await response.json();
      if (data.feedback) {
        setStoredFeedback(data.feedback);
        setFeedbackData(data.feedback);
        setLoading(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error checking for stored feedback:", err);
      return false;
    }
  };

  const fetchAndParseResults = async (resultsString) => {
    try {
      const parseResponse = await fetch('http://127.0.0.1:5000/parsejson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ input_string: resultsString }),
      });

      if (!parseResponse.ok) {
        const errorText = await parseResponse.text();
        throw new Error(`Failed to parse results: ${errorText}`);
      }

      const parsedData = await parseResponse.json();
      const resultsArray = parsedData.results;

      setFeedbackLoading(true);
      const feedbackResponse = await fetch('http://localhost:5000/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: resultsArray }),
      });
      console.log(feedbackResponse);
      if (!feedbackResponse.ok) {
        const errorText = await feedbackResponse.text();
        throw new Error(`Failed to fetch feedback: ${errorText}`);
      }
      console.log(feedbackData);
      const feedbackData = await feedbackResponse.json();
      
      // setFeedbackData(feedbackData);
      return feedbackData;
    } catch (err) {
      console.error("Error in fetchAndParseResults:", err);
      throw err;
    } finally {
      setFeedbackLoading(false);
    }
  };

  const storeFeedbackToBackend = async (feedback) => {
    try {
      console.log(feedbackData);
      const response = await fetch('http://localhost:4001/assignment/store-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          studentId,
          feedbackData: feedback
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store feedback');
      }

      const data = await response.json();
      setStoredFeedback(feedback);
      setSnackbar({
        open: true,
        message: 'Feedback saved successfully!',
        severity: 'success'
      });
      return data;
    } catch (err) {
      console.error("Error storing feedback:", err);
      setSnackbar({
        open: true,
        message: 'Failed to save feedback',
        severity: 'error'
      });
      throw err;
    }
  };

  const handleSaveFeedback = async () => {
    try {
      await storeFeedbackToBackend(feedbackData);
    } catch (err) {
      console.error("Error saving feedback:", err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
    refetchResult();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First check if we have stored feedback
        const hasStoredFeedback = await checkForStoredFeedback();
        if (hasStoredFeedback) {
          return;
        }

        // If no stored feedback, proceed with generating new feedback
        if (resultData) {
          const resultsString = resultData.result?.results;
          if (!resultsString) {
            throw new Error('No results data found.');
          }
          
          const feedback = await fetchAndParseResults(resultsString);
          await storeFeedbackToBackend(feedback);
        } else if (resultError) {
          throw resultError;
        }
      } catch (err) {
        console.error("Error in feedback process:", err);
        setError(err.message || 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId && studentId) {
      fetchData();
    }
  }, [resultData, resultError, retryCount, assignmentId, studentId]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading || resultLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          {storedFeedback ? 'Loading your feedback...' : 'Generating your feedback...'}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        p: 3
      }}>
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          Something went wrong
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (feedbackLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, textAlign: 'center' }}>
          Generating personalized feedback...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a moment
        </Typography>
      </Box>
    );
  }

  if (!feedbackData?.length) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        p: 3
      }}>
        <QAIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" color="text.secondary">
          No feedback data available
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      background: theme.palette.background.default
    }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Card sx={{ 
        backgroundColor: theme.palette.primary.main,
        color: 'common.white',
        mb: 4,
        position: 'relative'
      }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <FeedbackIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Detailed Feedback
          </Typography>
          <Typography variant="subtitle1">
            Personalized insights to help you improve
          </Typography>
          
          {storedFeedback ? (
            <Chip 
              label="Saved Feedback" 
              color="success" 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                color: 'white',
                backgroundColor: theme.palette.success.dark
              }} 
            />
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleSaveFeedback}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                borderRadius: 2
              }}
            >
              Save Feedback
            </Button>
          )}
        </CardContent>
      </Card>

      {feedbackData.map((feedback, index) => (
        <Card key={index} sx={{ 
          mb: 3, 
          borderLeft: feedback.error ? 
            `4px solid ${theme.palette.error.main}` : 
            `4px solid ${theme.palette.success.main}`
        }}>
          <CardContent>
            {feedback.error ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="error">
                    Error Processing Question
                  </Typography>
                  <Typography variant="body1">
                    {feedback.error}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <QAIcon color="primary" /> Question: {feedback.question}
                </Typography>

                <Stack spacing={2}>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CheckIcon color="info" /> Your Answer
                    </Typography>
                    <Typography variant="body1">
                      {feedback.context}
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CheckIcon color="info" /> Simplified Answer
                    </Typography>
                    <Typography variant="body1">
                      {feedback.answer}
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CheckIcon color="info" /> Evaluation
                    </Typography>
                    <Typography variant="body1">
                      {feedback.evaluation}
                    </Typography>
                  </Paper>

                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.success.light,
                    borderLeft: `4px solid ${theme.palette.success.main}`
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 'bold',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <TipIcon color="success" /> Improvement Tips
                    </Typography>
                    <Typography variant="body1">
                      {feedback.feedback}
                    </Typography>
                  </Paper>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {feedbackData.some((feedback) => feedback.error) && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2
            }}
          >
            Retry Failed Questions
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FeedbackPro;