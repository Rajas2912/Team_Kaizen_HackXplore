import React from 'react';
import { useLocation } from 'react-router-dom';
import PersonalizedFeedback from './PersonalizedFeedback'; // Import the feedback component
import { Box } from '@mui/material';

const FeedbackPage = () => {
  const location = useLocation();
  const { feedbackData } = location.state || { feedbackData: [] };

  return (
    <Box sx={{ p: 3 }}>

      <PersonalizedFeedback feedbackData={feedbackData} />
    </Box>
  );
};

export default FeedbackPage;