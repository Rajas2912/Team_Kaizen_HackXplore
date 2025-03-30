import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useLocation } from 'react-router-dom';
import { useGetSubmissionResultQuery } from '../redux/api/assignmentSlice';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Score as ScoreIcon,
  Percent as PercentIcon,
  Grade as GradeIcon,
  HelpOutline as QuestionIcon
} from '@mui/icons-material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const StudentReport3 = () => {
  const theme = useTheme();
  const location = useLocation();
  const { studentId, assignmentId } = location.state || {};
  const { data: resultData, error: resultError, isLoading: resultLoading } = useGetSubmissionResultQuery({ assignmentId, studentId });

  const [reportData, setReportData] = useState({
    results: [],
    totalScore: 0,
    assignmentTitle: 'Evaluation Report',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        throw new Error(`Server error: ${errorText}`);
      }

      const parsedData = await parseResponse.json();
      const resultsArray = parsedData.results;

      setReportData({
        results: resultsArray,
        totalScore: parsedData.total_score || 0,
        assignmentTitle: resultData.assignmentTitle || 'Evaluation Report',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultData) {
      try {
        const resultsString = resultData.result?.results;
        if (!resultsString) {
          throw new Error('No results data found.');
        }
        fetchAndParseResults(resultsString);
      } catch (err) {
        setError('Failed to parse results data.');
        setLoading(false);
      }
    } else if (resultError) {
      setError(resultError.message);
      setLoading(false);
    }
  }, [resultData, resultError]);

  if (loading || resultLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { results, totalScore, assignmentTitle } = reportData;
  const maxMarks = results.length * 10;
  const percentage = maxMarks > 0 ? ((totalScore / maxMarks) * 100)?.toFixed(2) : 0;
  const grade = percentage >= 90 ? 'A+' :
               percentage >= 80 ? 'A' :
               percentage >= 70 ? 'B' :
               percentage >= 60 ? 'C' : 'D';

  // Chart data configurations
  const barChartData = {
    labels: results.map((result) => `Q${result.question_no}`),
    datasets: [
      {
        label: 'Score (out of 10)',
        data: results.map((r) => r?.score || 0),
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [totalScore, Math.max(maxMarks - totalScore, 0)],
        backgroundColor: [theme.palette.success.main, theme.palette.error.main],
      },
    ],
  };

  const getScoreColor = (score) => {
    return score >= 8 ? 'success' :
           score >= 5 ? 'warning' : 'error';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 4, backgroundColor: theme.palette.primary.main }}>
        <CardContent sx={{ color: 'common.white', textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            {assignmentTitle}
          </Typography>
          <Typography variant="subtitle1">
            Detailed Evaluation Report
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ScoreIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Total Score</Typography>
            <Typography variant="h4" color="primary">
              {totalScore.toFixed(1)}/{maxMarks}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PercentIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Percentage</Typography>
            <Typography variant="h4" color="secondary">
              {percentage}%
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <GradeIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Grade</Typography>
            <Typography variant="h4" color="info">
              {grade}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <QuestionIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Questions</Typography>
            <Typography variant="h4">
              {results.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Question-wise Scores
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={barChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      max: 10,
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Score Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie 
                data={pieChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }} 
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Analysis
          </Typography>
          <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 2 }}>
            {results.map((result, index) => (
              <Paper key={index} sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Q{result.question_no}: {result.question}
                  </Typography>
                  <Chip 
                    label={`${(result.score ?? 0).toFixed(1)}/${(result.max_score ?? 10)}`}
                    color={getScoreColor(result.score)}
                    size="medium"
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Typography component="span" fontWeight="bold" color="primary">
                      Student Answer:
                    </Typography>{' '}
                    {result.answer || 'No answer provided'}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentReport3;