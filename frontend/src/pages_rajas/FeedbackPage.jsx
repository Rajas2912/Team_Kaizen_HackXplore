import React from 'react';
import { useLocation } from 'react-router-dom';
import PersonalizedFeedback from './PersonalizedFeedback'; // Import the feedback component

const FeedbackPage = () => {
  const location = useLocation();
  const { feedbackData } = location.state || { feedbackData: [] };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Personalized Feedback
      </Typography>
      <PersonalizedFeedback feedbackData={feedbackData} />
    </Box>
  );
};

export default FeedbackPage;