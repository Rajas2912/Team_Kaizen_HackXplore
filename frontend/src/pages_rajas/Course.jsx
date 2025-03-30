import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Typography, 
  CircularProgress,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Modal,
  IconButton,
  keyframes,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useGetAssignmentsByClassQuery } from "../redux/api/assignmentSlice";
import CloseIcon from '@mui/icons-material/Close';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const Course = ({ classId }) => {
  const { userInfo } = useSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    data: assignments = [],
    isLoading,
    isError,
    error,
    refetch
  } = useGetAssignmentsByClassQuery(classId);
  
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAssignmentClick = async (assignment) => {
    setSelectedAssignment(assignment);
    
    // Only fetch resources if the student has submitted
    const submission = getStudentSubmission(assignment);
    if (submission?.feedback?.length > 0) {
      await fetchResources(assignment);
    } else {
      setArticles([]);
      setYoutubeVideos([]);
      setResourceError("No feedback available for this submission");
    }
  };
  
  const fetchResources = async (assignment) => {
    try {
      setLoadingResources(true);
      setResourceError(null);
      
      const submission = getStudentSubmission(assignment);
      
      if (!submission || !submission.feedback) {
        throw new Error("No feedback data available");
      }
      
      // Format the feedback data for the API
      const feedbackData = submission.feedback.map(item => ({
        question: item.question,
        context: item.context || "", // Fallback to empty string if context is missing
        answer: item.answer,
        feedback: item.feedback
      }));

      // Fetch articles
      const articlesResponse = await fetch('http://localhost:5000/get-text-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!articlesResponse.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const articlesData = await articlesResponse.json();
      setArticles(articlesData.resources || []);
      
      // Fetch videos
      const videosResponse = await fetch('http://localhost:5000/recommend-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!videosResponse.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const videosData = await videosResponse.json();
      setYoutubeVideos(videosData.videos || []);
      
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResourceError(error.message);
      setNotification({
        open: true,
        message: "Failed to load learning resources",
        severity: "error"
      });
    } finally {
      setLoadingResources(false);
    }
  };

  const handleArticleClick = (article) => {
    if (!article.url) {
      setNotification({
        open: true,
        message: "This article doesn't have a valid URL",
        severity: "error"
      });
      return;
    }
    setSelectedArticle(article);
  };

  const handleCloseArticleModal = () => {
    setSelectedArticle(null);
  };
  
  const getScoreColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'default';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'primary';
    return 'error';
  };

  const hasStudentSubmitted = (assignment) => {
    return assignment.submissions?.some(
      (submission) => submission.studentId === userInfo._id
    );
  };

  const getStudentSubmission = (assignment) => {
    return assignment.submissions?.find(sub => sub.studentId === userInfo._id);
  };

  const getStudentScore = (assignment) => {
    const submission = getStudentSubmission(assignment);
    return submission?.result?.total_score;
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Helper function to extract domain from URL
  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return '';
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)'
    }}>
      <Grid container spacing={3}>
        {/* Assignments List - Left Side */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ 
            p: 2, 
            height: '100%', 
            border: 'none',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
            }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: '600', 
              color: theme.palette.primary.dark,
              fontSize: '1.2rem',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box component="span" sx={{
                width: '8px',
                height: '8px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '50%',
                mr: 1.5,
                animation: `${pulseAnimation} 2s infinite`
              }} />
              Assignments
            </Typography>
            <Typography variant="body2" sx={{ 
              mb: 2, 
              color: theme.palette.text.secondary,
              fontSize: '0.85rem',
              backgroundColor: theme.palette.grey[100],
              p: 1,
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              Class ID: {classId}
            </Typography>
            
            <Divider sx={{ 
              my: 2, 
              borderColor: theme.palette.divider,
              borderBottomWidth: '2px',
              borderBottomStyle: 'dashed'
            }} />
            
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <CircularProgress sx={{ color: theme.palette.primary.light }} />
              </Box>
            ) : isError ? (
              <Box sx={{ 
                p: 2, 
                color: theme.palette.error.contrastText,
                backgroundColor: theme.palette.error.light,
                borderRadius: '8px',
                borderLeft: `4px solid ${theme.palette.error.main}`
              }}>
                Error loading assignments: {error?.data?.message || error.message}
              </Box>
            ) : (
              <List sx={{ 
                overflowY: 'auto', 
                maxHeight: 'calc(100vh - 200px)',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.primary.light,
                  borderRadius: '3px',
                }
              }}>
                {assignments.map((assignment, index) => {
                  const score = getStudentScore(assignment);
                  const maxScore = 100;
                  const submitted = hasStudentSubmitted(assignment);
                  
                  return (
                    <ListItem 
                      key={assignment._id}
                      button
                      onClick={() => handleAssignmentClick(assignment)}
                      selected={selectedAssignment?._id === assignment._id}
                      sx={{
                        mb: 1.5,
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          backgroundColor: theme.palette.primary.lighter,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          animation: `${floatAnimation} 3s ease-in-out infinite`
                        },
                        '&.Mui-selected': { 
                          backgroundColor: theme.palette.primary.light,
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light
                          }
                        }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start' 
                        }}>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: '600', 
                                color: selectedAssignment?._id === assignment._id ? 
                                  theme.palette.primary.dark : 'text.primary',
                                fontSize: '0.95rem'
                              }}>
                                {assignment.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ 
                                color: selectedAssignment?._id === assignment._id ? 
                                  theme.palette.primary.dark : 'text.secondary',
                                fontSize: '0.8rem',
                                lineHeight: '1.3'
                              }}>
                                {assignment.description}
                              </Typography>
                            }
                            sx={{ mb: 1 }}
                          />
                          {score !== undefined && (
                            <Chip 
                              label={`${score}/${maxScore}`}
                              size="small"
                              color={getScoreColor(score, maxScore)}
                              sx={{ 
                                ml: 1,
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            />
                          )}
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mt: 1 
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: 'text.disabled',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Box component="span" sx={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: theme.palette.grey[400],
                              borderRadius: '50%',
                              mr: 0.5
                            }} />
                            Due: {new Date(assignment.deadline).toLocaleDateString()}
                          </Typography>
                          {submitted ? (
                            <Chip 
                              label="Submitted" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                borderWidth: '1.5px',
                                fontWeight: '600'
                              }}
                            />
                          ) : (
                            <Chip 
                              label="Pending" 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                borderWidth: '1.5px',
                                fontWeight: '600'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Assignment Details - Right Side */}
        <Grid item xs={12} md={8}>
          {selectedAssignment ? (
            <Paper elevation={3} sx={{ 
              p: 4, 
              height: '100%', 
              border: 'none',
              borderRadius: '16px',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                mb: 3,
                position: 'relative'
              }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: '700', 
                    color: theme.palette.primary.dark,
                    fontSize: isMobile ? '1.5rem' : '1.8rem',
                    lineHeight: '1.2',
                    mb: 1
                  }}>
                    {selectedAssignment.title}
                  </Typography>
                  <Box sx={{
                    width: '50px',
                    height: '4px',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: '2px',
                    mb: 2
                  }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {hasStudentSubmitted(selectedAssignment) ? (
                    <Chip 
                      label={`Score: ${getStudentScore(selectedAssignment) || 0}/100`}
                      color={getScoreColor(
                        getStudentScore(selectedAssignment) || 0,
                        100
                      )}
                      sx={{
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <Chip 
                      label="Not submitted"
                      color="default"
                      sx={{
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        backgroundColor: theme.palette.grey[200],
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    />
                  )}
                  <Chip 
                    label={`Due: ${new Date(selectedAssignment.deadline).toLocaleDateString()}`}
                    sx={{
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      backgroundColor: theme.palette.grey[100],
                      color: theme.palette.text.secondary,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  />
                </Box>
              </Box>
              
              <Typography variant="subtitle1" sx={{ 
                mb: 3, 
                color: theme.palette.text.secondary,
                lineHeight: '1.6',
                fontSize: '1rem',
                backgroundColor: theme.palette.grey[50],
                p: 2,
                borderRadius: '8px',
                borderLeft: `3px solid ${theme.palette.primary.light}`
              }}>
                {selectedAssignment.description}
              </Typography>
              
              <Divider sx={{ 
                my: 3, 
                borderColor: theme.palette.divider,
                borderBottomWidth: '2px',
                borderBottomStyle: 'dotted'
              }} />
              
              {/* Articles Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: '600', 
                  color: theme.palette.primary.dark,
                  fontSize: '1.2rem',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box component="span" sx={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 1.5,
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    A
                  </Box>
                  Recommended Articles
                </Typography>
                
                {loadingResources ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : resourceError ? (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                    borderRadius: '8px',
                    mb: 2
                  }}>
                    {resourceError}
                  </Box>
                ) : articles.length > 0 ? (
                  <Grid container spacing={3}>
                    {articles.map((article, index) => {
                      const domain = getDomainFromUrl(article.url);
                      const domainInitial = domain.split('.')[0]?.charAt(0)?.toUpperCase() || 'A';
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: '12px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f9faff 100%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: `1px solid ${theme.palette.grey[200]}`,
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 8px 24px ${theme.palette.primary.light}33`,
                              borderColor: theme.palette.primary.light
                            }
                          }}>
                            <CardActionArea 
                              onClick={() => handleArticleClick(article)}
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                p: 2.5
                              }}
                            >
                              <Box sx={{
                                width: '100%',
                                height: '140px',
                                background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}20 100%)`,
                                borderRadius: '8px',
                                mb: 2.5,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                              }}>
                                <Box sx={{
                                  position: 'absolute',
                                  top: '-20px',
                                  right: '-20px',
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '50%',
                                  backgroundColor: theme.palette.primary.light,
                                  opacity: 0.1
                                }} />
                                <Typography variant="h4" sx={{ 
                                  color: theme.palette.primary.main,
                                  fontWeight: 'bold',
                                  fontSize: '1.8rem',
                                  opacity: 0.8,
                                  zIndex: 1
                                }}>
                                  {domainInitial}
                                </Typography>
                              </Box>
                              <CardContent sx={{ 
                                p: 0,
                                width: '100%'
                              }}>
                                <Typography gutterBottom variant="subtitle1" component="div" sx={{
                                  fontWeight: '700',
                                  fontSize: '1.05rem',
                                  lineHeight: '1.3',
                                  mb: 1.5,
                                  color: theme.palette.primary.dark
                                }}>
                                  {article.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{
                                  fontSize: '0.85rem',
                                  lineHeight: '1.5',
                                  mb: 2,
                                  color: theme.palette.text.secondary
                                }}>
                                  {article.description}
                                </Typography>
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%'
                                }}>
                                  <Typography variant="caption" sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    Read Article
                                    <Box component="span" sx={{
                                      ml: 1,
                                      transition: 'transform 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateX(3px)'
                                      }
                                    }}>
                                      →
                                    </Box>
                                  </Typography>
                                  {domain && (
                                    <Typography variant="caption" sx={{
                                      color: theme.palette.grey[500],
                                      fontSize: '0.7rem'
                                    }}>
                                      {domain}
                                    </Typography>
                                  )}
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    py: 2,
                    fontStyle: 'italic'
                  }}>
                    No articles recommended for this assignment
                  </Typography>
                )}
              </Box>      
              {/* YouTube Videos Section */}
              <Box>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: '600', 
                  color: theme.palette.primary.dark,
                  fontSize: '1.2rem',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box component="span" sx={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: theme.palette.error.light,
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 1.5,
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    V
                  </Box>
                  Recommended Videos
                </Typography>
                
                {loadingResources ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : resourceError ? (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                    borderRadius: '8px',
                    mb: 2
                  }}>
                    {resourceError}
                  </Box>
                ) : youtubeVideos.length > 0 ? (
                  <Grid container spacing={3}>
                    {youtubeVideos.map((video, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ 
                          height: '100%',
                          borderRadius: '12px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fff9f9 100%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          border: `1px solid ${theme.palette.grey[200]}`,
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 8px 24px ${theme.palette.error.light}33`,
                            borderColor: theme.palette.error.light
                          }
                        }}>
                          <CardActionArea 
                            component="a" 
                            href={video.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <CardMedia
                              component="img"
                              height="160"
                              image={video.thumbnail}
                              alt={video.title}
                              sx={{
                                borderTopLeftRadius: '12px',
                                borderTopRightRadius: '12px'
                              }}
                            />
                            <CardContent sx={{
                              backgroundColor: 'transparent',
                              p: 2.5
                            }}>
                              <Typography gutterBottom variant="subtitle1" component="div" sx={{
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                lineHeight: '1.3',
                                mb: 1,
                                color: theme.palette.text.primary
                              }}>
                                {video.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                color: theme.palette.text.secondary
                              }}>
                                <Box component="span" sx={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  backgroundColor: theme.palette.error.main,
                                  borderRadius: '50%',
                                  mr: 1,
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}>
                                  YT
                                </Box>
                                {video.channel}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary',
                    py: 2,
                    fontStyle: 'italic'
                  }}>
                    No videos recommended for this assignment
                  </Typography>
                )}
              </Box>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ 
              p: 4, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: 'none',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <Box sx={{
                width: '120px',
                height: '120px',
                backgroundColor: theme.palette.primary.lighter,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3,
                animation: `${pulseAnimation} 2s infinite`
              }}>
                <Box sx={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: theme.palette.primary.light,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {assignments.length > 0 ? '📚' : '🕵️'}
                </Box>
              </Box>
              <Typography variant="h5" sx={{ 
                mb: 2, 
                color: theme.palette.primary.dark,
                fontWeight: '600'
              }}>
                {assignments.length > 0 ? 
                  "Select an assignment to view details" : 
                  "No assignments found"}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: '400px',
                lineHeight: '1.6'
              }}>
                {assignments.length > 0 ? 
                  "Click on an assignment in the list to explore learning resources" : 
                  "Please check back later or contact your instructor for updates"}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Article Preview Modal */}
      <Modal
        open={Boolean(selectedArticle)}
        onClose={handleCloseArticleModal}
        aria-labelledby="article-modal-title"
        aria-describedby="article-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Paper sx={{
          width: '95vw',
          height: '95vh',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: theme.shadows[15],
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.5,
            backgroundColor: theme.palette.primary.dark,
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box component="span" sx={{
                width: '32px',
                height: '32px',
                backgroundColor: 'white',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 2,
                color: theme.palette.primary.dark,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                {selectedArticle?.url ? getDomainFromUrl(selectedArticle.url).split('.')[0]?.charAt(0)?.toUpperCase() : 'A'}
              </Box>
              {selectedArticle?.title}
            </Typography>
            <IconButton 
              onClick={handleCloseArticleModal} 
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
          </Box>
          
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Box sx={{
              flex: 1,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <iframe 
                src={selectedArticle?.url}
                title={selectedArticle?.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </Box>
            
            <Box sx={{
              p: 2,
              backgroundColor: theme.palette.grey[100],
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                fontSize: '0.85rem'
              }}>
                {selectedArticle?.url ? `Reading: ${getDomainFromUrl(selectedArticle.url)}` : ''}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.disabled',
                fontSize: '0.75rem'
              }}>
                Use browser controls to navigate
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Modal>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ 
            width: '100%',
            boxShadow: theme.shadows[6],
            borderRadius: '12px',
            alignItems: 'center'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Course;
