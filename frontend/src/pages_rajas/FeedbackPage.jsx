import React from 'react';
import { useLocation } from 'react-router-dom';
import PersonalizedFeedback from './PersonalizedFeedback'; // Import the feedback component
import { Box } from '@mui/material';

const FeedbackPage = () => {
  const location = useLocation();
  const { feedbackData } = location.state || { feedbackData: [] };
  // const feedbackData = [
  //   {
  //     answer: "Joseph Stalin",
  //     context: "Joseph Stalin was the leader of the Soviet Union throughout World War II.",
  //     evaluation: "Correct answer",
  //     feedback: "Nice work! Your answer accurately identifies Joseph Stalin as the leader of the Soviet Union during World War II.",
  //     question: "Who was the leader of the Soviet Union during World War II?"
  //   },
  //   {
  //     answer: "Gregor Mendel is known as the father of genetics.",
  //     context: "Gregor Mendel conducted groundbreaking experiments with pea plants in the mid-1800s. His work laid the foundation for the understanding of inheritance and genetics.",
  //     evaluation: "Accurate and complete answer.",
  //     feedback: "Excellent! You have correctly attributed the title of 'father of genetics' to Gregor Mendel.",
  //     question: "Who is known as the father of genetics?"
  //   }
  // ];
  

  return (
    <Box sx={{ p: 3 }}>

      <PersonalizedFeedback feedbackData={feedbackData} />
    </Box>
  );
};

export default FeedbackPage;