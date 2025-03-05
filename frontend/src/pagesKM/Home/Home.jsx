import React from 'react'
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from '@mui/material'
import { motion } from 'framer-motion'
import { styled } from '@mui/system'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PeopleIcon from '@mui/icons-material/People'
import ScheduleIcon from '@mui/icons-material/Schedule'
import SchoolIcon from '@mui/icons-material/School'
import StarIcon from '@mui/icons-material/Star'
import { useNavigate } from 'react-router'
// import Footer from './Footer' // Assume you have a Footer component

// Custom styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  padding: theme.spacing(10, 2),
  textAlign: 'center',
  borderRadius: '0 0 20% 20%',
}))

const FeatureCard = styled(Card)(({ theme }) => ({
  maxWidth: 345,
  margin: 'auto',
  textAlign: 'center',
  padding: theme.spacing(3),
  borderRadius: 15,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}))

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF4081 30%, #F50057 90%)',
  border: 0,
  borderRadius: 15,
  color: 'white',
  padding: '10px 20px',
  boxShadow: '0 3px 5px 2px rgba(255, 64, 129, .3)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}))

const Home = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome to Our LMS Platform
            </Typography>
            <Typography variant="h5" gutterBottom>
              Empowering Education with Advanced Tools and AI-Driven Scheduling
            </Typography>
            <StyledButton
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => navigate('/login')}
            >
              Get Started
            </StyledButton>
          </motion.div>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Key Features
        </Typography>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignContent={'center'}
        >
          {[
            {
              title: 'Course Creation',
              description:
                'Easily create and manage courses with multimedia content.',
              icon: '📚',
            },
            {
              title: 'Progress Tracking',
              description:
                'Track learner progress and generate detailed reports.',
              icon: '📊',
            },
            {
              title: 'AI Scheduling',
              description: 'Optimize schedules with our AI-driven system.',
              icon: '🤖',
            },
            {
              title: 'Mentor-Mentee Connect',
              description:
                'Enhance communication and guidance between mentors and mentees.',
              icon: '👥',
            },
          ].map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <FeatureCard className="justify-center items-center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mb: 2,
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ background: theme.palette.background.paper, py: 8 }}>
        <Container>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <List>
                {[
                  'Comprehensive course management tools',
                  'AI-driven scheduling for optimal time management',
                  'Seamless mentor-mentee communication',
                  'Real-time progress tracking and analytics',
                  'Certification upon course completion',
                ].map((text, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img
                  src="https://via.placeholder.com/500x300" // Replace with your image
                  alt="Benefits"
                  style={{ width: '100%', borderRadius: 15 }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mentor-Mentee Connect Section */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Mentor-Mentee Connect
        </Typography>
        <Typography variant="h6" align="center" gutterBottom sx={{ mb: 4 }}>
          Streamline communication and automate scheduling tasks for students,
          mentors, and administrators.
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: 'Student Profiles',
              description:
                'Manage academic status, extracurricular activities, internships, and achievements.',
              icon: <PeopleIcon fontSize="large" />,
            },
            {
              title: 'Mentor Guidance',
              description:
                'Mentors oversee student progress and provide personalized guidance.',
              icon: <SchoolIcon fontSize="large" />,
            },
            {
              title: 'AI Scheduling',
              description:
                'Optimize timetables with our Genetic Algorithm-based system.',
              icon: <ScheduleIcon fontSize="large" />,
            },
          ].map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <FeatureCard>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mb: 2,
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ background: theme.palette.background.paper, py: 8 }}>
        <Container>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            What Our Users Say
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                name: 'John Doe',
                role: 'Student',
                testimonial:
                  'This platform has transformed the way I learn. The AI scheduling is a game-changer!',
                avatar: 'https://via.placeholder.com/150',
              },
              {
                name: 'Jane Smith',
                role: 'Mentor',
                testimonial:
                  'The Mentor-Mentee Connect system makes it so easy to guide my students effectively.',
                avatar: 'https://via.placeholder.com/150',
              },
              {
                name: 'Alice Johnson',
                role: 'Administrator',
                testimonial:
                  'Managing courses and schedules has never been easier. Highly recommend this platform!',
                avatar: 'https://via.placeholder.com/150',
              },
            ].map((testimonial, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <FeatureCard>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 80, height: 80, mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 'bold' }}
                    >
                      {testimonial.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {testimonial.role}
                    </Typography>
                    <Typography variant="body1" align="center">
                      "{testimonial.testimonial}"
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ background: theme.palette.background.default, py: 8 }}>
        <Container>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Ready to Transform Your Learning Experience?
          </Typography>
          <Typography variant="h6" align="center" gutterBottom sx={{ mb: 4 }}>
            Join thousands of users who are already benefiting from our
            platform.
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <StyledButton
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
            >
              Sign Up Now
            </StyledButton>
          </Box>
        </Container>
      </Box>

      {/* Footer Section */}
      {/* <Footer /> */}
    </Box>
  )
}

export default Home
