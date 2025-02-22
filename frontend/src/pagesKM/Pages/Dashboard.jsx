import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  useTheme,
} from '@mui/material'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { InsertChart, Assignment, Quiz, Download } from '@mui/icons-material'

// Dummy Data Objects
const vivaResults = {
  totalQuestions: 2,
  questionAnswerSet: [
    {
      evaluation: '1.0',
      parameters: { Relevance: 2, Completeness: 1, Accuracy: 0, Depth: 1 },
    },
    {
      evaluation: '0.25',
      parameters: { Relevance: 1, Completeness: 0, Accuracy: 0, Depth: 0 },
    },
  ],
  proctoredFeedback: {
    multipleUsersDetectedCount: 1,
    otherIssues: 0,
  },
  overallMark: 5,
}

const examResults = [
  { subject: 'France Quiz', score: 3, total: 3, date: '2025-02-21' },
  { subject: 'Math Basics', score: 8, total: 10, date: '2025-02-20' },
  { subject: 'Science Test', score: 7, total: 10, date: '2025-02-19' },
]

const assignments = [
  {
    title: 'WW2 History',
    description: 'Complete the World War 2 questions',
    deadline: '2025-03-08',
    status: 'Pending',
  },
  {
    title: 'Modern Physics',
    description: 'Chapter 5 exercises',
    deadline: '2025-03-10',
    status: 'Pending',
  },
]

const Dashboard = () => {
  const theme = useTheme()

  // Radar Chart Data Transformation
  const radarData = Object.keys(
    vivaResults.questionAnswerSet[0].parameters
  ).map((key) => ({
    parameter: key,
    score: vivaResults.questionAnswerSet[0].parameters[key],
    fullMark: 10,
  }))

  // Proctoring Alerts Data
  const proctoringData = [
    {
      name: 'Multiple Users',
      value: vivaResults.proctoredFeedback.multipleUsersDetectedCount,
    },
    { name: 'Other Issues', value: vivaResults.proctoredFeedback.otherIssues },
  ]

  // Colors for Charts
  const COLORS = [theme.palette.primary.main, '#8884d8', '#82ca9d']

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.primary.main }}
      >
        Student Dashboard
      </Typography>

      {/* Quick Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.primary.light }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Quiz sx={{ mr: 1 }} /> Latest Exam Score
              </Typography>
              <Typography variant="h3">
                {examResults[0].score}/{examResults[0].total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.primary.light }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <InsertChart sx={{ mr: 1 }} /> Viva Performance
              </Typography>
              <Typography variant="h3">{vivaResults.overallMark}/10</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Viva Evaluation Metrics
              </Typography>
              <RadarChart
                outerRadius={90}
                width={400}
                height={300}
                data={radarData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="parameter" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar
                  dataKey="score"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.6}
                />
              </RadarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proctoring Alerts
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={proctoringData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {proctoringData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Assignments */}
      <Typography
        variant="h5"
        sx={{ mt: 4, mb: 2, color: theme.palette.primary.main }}
      >
        <Assignment sx={{ mr: 1 }} /> Upcoming Assignments
      </Typography>
      <Grid container spacing={3}>
        {assignments.map((assignment, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{assignment.title}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {assignment.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Typography variant="body2">
                    Deadline: {assignment.deadline}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    size="small"
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard
