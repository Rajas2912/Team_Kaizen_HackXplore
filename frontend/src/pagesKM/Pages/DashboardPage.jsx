import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Box, Typography, Grid, CircularProgress, Card, CardContent, Paper, Stack } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import QuizIcon from '@mui/icons-material/Quiz'; // Icon for quizzes
import AssignmentIcon from '@mui/icons-material/Assignment'; // Icon for assignments
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'; // Icon for vivas

const API = import.meta.env.VITE_BACKEND_URL;
const COLORS = ['#1976D2', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [userid, setUserid] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [vivaResults, setVivaResults] = useState([]);
  const [dueDates, setDueDates] = useState([]);
  const [loading, setLoading] = useState(true);

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
        
        // Combine all due dates into a single array
        const combinedDueDates = [
          ...(dueDateRes?.data?.assignments || []).map((item) => ({ ...item, type: 'Assignment' })),
          ...(dueDateRes?.data?.quizzes || []).map((item) => ({ ...item, type: 'Quiz' })),
          ...(dueDateRes?.data?.vivas || []).map((item) => ({ ...item, type: 'Viva' })),
        ];

        // Sort by due date in ascending order
        combinedDueDates.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));

        setDueDates(combinedDueDates);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [userid]);

  // Prepare data for the Line Chart
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

  // Combine quiz and viva data and sort by date
  const lineChartData = [...quizLineData, ...vivaLineData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const quizData = quizResults.map((quiz) => ({ name: quiz.quizid, score: quiz.overallMark }));
  const vivaData = vivaResults.map((viva) => ({ name: viva.vivaId, score: viva.overallMark }));
  const pieData = [
    { name: 'Quizzes', value: quizResults.length },
    { name: 'Vivas', value: vivaResults.length },
  ];

  const totalAttempts = quizResults.length + vivaResults.length;
  const progress = ((quizResults.length + vivaResults.length) / (totalAttempts || 1)) * 100;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2', mb: 4 }}>
        Dashboard
      </Typography> */}

      {/* Three Horizontal Cards for Vivas, Quizzes, and Assignments */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Vivas Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <RecordVoiceOverIcon sx={{ fontSize: 40, color: '#1976D2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Vivas 
                  </Typography>
                  <Typography variant="body1">{vivaResults.length} Vivas</Typography>
                </Box>
              </Box>
              <CircularProgress variant="determinate" value={(vivaResults.length / totalAttempts) * 100} size={60} thickness={5} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Quizzes Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <QuizIcon sx={{ fontSize: 40, color: '#00C49F' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Quizzes 
                  </Typography>
                  <Typography variant="body1">{quizResults.length} Quizzes</Typography>
                </Box>
              </Box>
              <CircularProgress variant="determinate" value={(quizResults.length / totalAttempts) * 100} size={60} thickness={5} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#FF8042' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Assignments 
                  </Typography>
                  <Typography variant="body1">0 Assignments</Typography>
                </Box>
              </Box>
              <CircularProgress variant="determinate" value={0} size={60} thickness={5} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Side: Line Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                Quiz & Viva Performance Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="quizScore"
                    name="Quiz Scores"
                    stroke="#1976D2"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="vivaScore"
                    name="Viva Scores"
                    stroke="#00C49F"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Upcoming Due Dates (Scrollable) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                Upcoming Due Dates
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {dueDates.length > 0 ? (
                    dueDates.map((due, index) => (
                      <motion.div key={index} whileHover={{ scale: 1.02 }}>
                        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {due.type}: {due.name} ({due.classname})
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Due: {new Date(due.duedate).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </motion.div>
                    ))
                  ) : (
                    <Typography>No upcoming due dates.</Typography>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Left Side: Viva Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                Viva Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Recent Activity (Scrollable) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                Recent Activity
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {quizResults.slice(0, 3).map((quiz, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.02 }}>
                      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Quiz: {quiz.quizid.quizname}</Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>Score: {quiz.overallMark}</Typography>
                      </Paper>
                    </motion.div>
                  ))}
                  {vivaResults.slice(0, 3).map((viva, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.02 }}>
                      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Viva: {viva.vivaId.vivaname}</Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>Score: {viva.overallMark}</Typography>
                      </Paper>
                    </motion.div>
                  ))}
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
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 4 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export default DashboardPage;