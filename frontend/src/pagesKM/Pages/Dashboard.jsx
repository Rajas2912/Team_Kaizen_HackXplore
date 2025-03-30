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
  Paper,
  Divider,
  Chip
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
  ResponsiveContainer
} from 'recharts'
import { InsertChart, Assignment, Quiz, Download, Assessment, Timeline } from '@mui/icons-material'

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
  const COLORS = ['#4e79a7', '#f28e2b', '#e15759']

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ 
          color: '#333',
          fontWeight: 600,
          mb: 4,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Assessment sx={{ mr: 2, color: theme.palette.primary.main }} />
        Student Dashboard
      </Typography>

      {/* Quick Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4e79a7 0%, #76b7b2 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Quiz sx={{ mr: 1, fontSize: '2rem' }} />
                <Typography variant="h6">Latest Exam Score</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {examResults[0].score}/{examResults[0].total}
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                {examResults[0].subject}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f28e2b 0%, #e15759 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InsertChart sx={{ mr: 1, fontSize: '2rem' }} />
                <Typography variant="h6">Viva Performance</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {vivaResults.overallMark}/10
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Overall Evaluation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #59a14f 0%, #8cd17d 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline sx={{ mr: 1, fontSize: '2rem' }} />
                <Typography variant="h6">Recent Progress</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="h6">75%</Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 1, opacity: 0.9 }}>
                Course completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Viva Evaluation Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis 
                    dataKey="parameter" 
                    tick={{ fill: '#555', fontSize: 12 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#888" />
                  <Radar
                    dataKey="score"
                    stroke="#4e79a7"
                    fill="#4e79a7"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Proctoring Alerts
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={proctoringData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {proctoringData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} alerts`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Exams */}
      <Card sx={{ 
        mt: 4,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Exam Results
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {examResults.map((exam, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {exam.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ width: '100%', mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(exam.score / exam.total) * 100} 
                        color={
                          (exam.score / exam.total) >= 0.8 ? 'success' : 
                          (exam.score / exam.total) >= 0.5 ? 'warning' : 'error'
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {exam.score}/{exam.total}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                    Taken on {exam.date}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Upcoming Assignments */}
      <Card sx={{ 
        mt: 4,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Upcoming Assignments
            </Typography>
            <Button variant="outlined" color="primary" size="small">
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {assignments.map((assignment, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {assignment.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {assignment.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={assignment.status} 
                      size="small" 
                      color={assignment.status === 'Pending' ? 'warning' : 'success'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 3
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#e15759', fontWeight: 500 }}>
                      Due: {assignment.deadline}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Download />}
                      size="small"
                      sx={{ 
                        borderRadius: '20px',
                        textTransform: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Dashboard