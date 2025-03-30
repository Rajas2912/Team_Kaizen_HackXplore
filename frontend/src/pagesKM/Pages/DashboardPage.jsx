import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Card, 
  CardContent, 
  Paper, 
  Stack,
  Divider,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { motion } from 'framer-motion';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Rest of your component code remains the same...

const API = import.meta.env.VITE_BACKEND_URL;

const DashboardPage = () => {
  const theme = useTheme();
  const { userInfo } = useSelector((state) => state.user);
  console.log(userInfo);
  const [userid, setUserid] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [vivaResults, setVivaResults] = useState([]);
  const [dueDates, setDueDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom color palette
  const COLORS = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    vivas: '#716da6',
    quizzes: '#a27eb8',
    assignments: '#B7A7AE'
  };

  useEffect(() => {
    if (userInfo?._id) setUserid(userInfo._id);
  }, [userInfo?._id]);

  useEffect(() => {
    if (!userid) return;

    const fetchData = async () => {
      try {
        const [quizRes, vivaRes, dueDateRes] = await Promise.all([
          axios.get(`${API}/quizresult/quizresultbystudentid/${userid}`),
          axios.get(`${API}/vivaresult/getvivaresultbystudentid/${userid}`),
          axios.get(`${API}/dashboard/getduedate/${userid}`),
        ]);

        setQuizResults(quizRes.data);
        setVivaResults(vivaRes.data);
        
        const combinedDueDates = [
          ...(dueDateRes?.data?.assignments || []).map((item) => ({ ...item, type: 'Assignment' })),
          ...(dueDateRes?.data?.quizzes || []).map((item) => ({ ...item, type: 'Quiz' })),
          ...(dueDateRes?.data?.vivas || []).map((item) => ({ ...item, type: 'Viva' })),
        ];

        combinedDueDates.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));
        setDueDates(combinedDueDates);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [userid]);

  // Prepare chart data
  const quizLineData = quizResults.map((quiz) => ({
    date: new Date(quiz.dateofquiz).toLocaleDateString(),
    quizScore: quiz.overallMark,
    vivaScore: null,
  }));

  const vivaLineData = vivaResults.map((viva) => ({
    date: new Date(viva.dateOfViva).toLocaleDateString(),
    quizScore: null,
    vivaScore: viva.overallMark,
  }));

  const lineChartData = [...quizLineData, ...vivaLineData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const pieData = [
    { name: 'Quizzes', value: quizResults.length, color: COLORS.quizzes },
    { name: 'Vivas', value: vivaResults.length, color: COLORS.vivas },
  ];

  const totalAttempts = quizResults.length + vivaResults.length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <AssessmentIcon fontSize="large" />
          Student Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
          Overview of your academic performance and upcoming tasks
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Vivas Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderLeft: `4px solid ${COLORS.vivas}`,
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: `${COLORS.vivas}20`,
                  borderRadius: '50%'
                }}>
                  <RecordVoiceOverIcon sx={{ fontSize: 28, color: COLORS.vivas }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Vivas Completed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.vivas }}>
                    {vivaResults.length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {((vivaResults.length / totalAttempts) * 100 || 0).toFixed(0)}% of total assessments
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(vivaResults.length / totalAttempts) * 100 || 0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    mt: 1,
                    backgroundColor: `${COLORS.vivas}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: COLORS.vivas
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quizzes Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderLeft: `4px solid ${COLORS.quizzes}`,
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: `${COLORS.quizzes}20`,
                  borderRadius: '50%'
                }}>
                  <QuizIcon sx={{ fontSize: 28, color: COLORS.quizzes }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Quizzes Completed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.quizzes }}>
                    {quizResults.length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {((quizResults.length / totalAttempts) * 100 || 0).toFixed(0)}% of total assessments
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(quizResults.length / totalAttempts) * 100 || 0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    mt: 1,
                    backgroundColor: `${COLORS.quizzes}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: COLORS.quizzes
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderLeft: `4px solid ${COLORS.assignments}`,
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: `${COLORS.assignments}20`,
                  borderRadius: '50%'
                }}>
                  <AssignmentIcon sx={{ fontSize: 28, color: COLORS.assignments }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Upcoming Assignments
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.assignments }}>
                    {dueDates.filter(d => d.type === 'Assignment').length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {dueDates.length} total upcoming tasks
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    mt: 1,
                    backgroundColor: `${COLORS.assignments}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: COLORS.assignments
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Performance Over Time
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <RechartsTooltip 
                    content={<CustomTooltip />}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: theme.shadows[3],
                      backgroundColor: theme.palette.background.paper
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="quizScore"
                    name="Quiz Scores"
                    stroke={COLORS.quizzes}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COLORS.quizzes }}
                    activeDot={{ r: 6, stroke: COLORS.quizzes, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vivaScore"
                    name="Viva Scores"
                    stroke={COLORS.vivas}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COLORS.vivas }}
                    activeDot={{ r: 6, stroke: COLORS.vivas, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Due Dates */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            height: '100%'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EventIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upcoming Due Dates
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                <Stack spacing={2}>
                  {dueDates.length > 0 ? (
                    dueDates.map((due, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          borderLeft: `3px solid ${
                            due.type === 'Quiz' ? COLORS.quizzes : 
                            due.type === 'Viva' ? COLORS.vivas : 
                            COLORS.assignments
                          }`
                        }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Chip 
                                label={due.type} 
                                size="small" 
                                sx={{ 
                                  mb: 1,
                                  backgroundColor: 
                                    due.type === 'Quiz' ? `${COLORS.quizzes}20` : 
                                    due.type === 'Viva' ? `${COLORS.vivas}20` : 
                                    `${COLORS.assignments}20`,
                                  color: 
                                    due.type === 'Quiz' ? COLORS.quizzes : 
                                    due.type === 'Viva' ? COLORS.vivas : 
                                    COLORS.assignments
                                }} 
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {due.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                {due.classname}
                              </Typography>
                            </Box>
                            <Chip 
                              label={new Date(due.duedate).toLocaleDateString()} 
                              size="small" 
                              sx={{ 
                                backgroundColor: `${theme.palette.primary.main}20`,
                                color: theme.palette.primary.main
                              }} 
                            />
                          </Box>
                        </Paper>
                      </motion.div>
                    ))
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                        No upcoming due dates
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Assessment Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Assessment Distribution
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [`${value} ${name}`, 'Count']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: theme.shadows[3],
                      backgroundColor: theme.palette.background.paper
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                <Stack spacing={2}>
                  {[...quizResults.slice(0, 3), ...vivaResults.slice(0, 3)]
                    .sort((a, b) => new Date(b.dateofquiz || b.dateOfViva) - new Date(a.dateofquiz || a.dateOfViva))
                    .map((item, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          borderLeft: `3px solid ${
                            item.dateofquiz ? COLORS.quizzes : COLORS.vivas
                          }`
                        }}>
                          <Box display="flex" justifyContent="space-between">
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {item.dateofquiz ? 'Quiz' : 'Viva'}: {item.quizid?.quizname || item.vivaId?.vivaname}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Completed on {new Date(item.dateofquiz || item.dateOfViva).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`Score: ${item.overallMark}`} 
                              size="small" 
                              sx={{ 
                                backgroundColor: item.overallMark >= 7 ? `${COLORS.success}20` : `${COLORS.warning}20`,
                                color: item.overallMark >= 7 ? COLORS.success : COLORS.warning
                              }} 
                            />
                          </Box>
                        </Paper>
                      </motion.div>
                    ))
                  }
                  {quizResults.length === 0 && vivaResults.length === 0 && (
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                        No recent activity
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ 
        p: 2, 
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[3]
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: entry.color
            }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

export default DashboardPage;