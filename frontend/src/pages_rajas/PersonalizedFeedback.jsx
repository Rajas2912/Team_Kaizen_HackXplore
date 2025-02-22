import React from 'react';
import './PersonalizedFeedback.css'; // Import the CSS for styling

const PersonalizedFeedback = ({ feedbackData }) => {
  return (
    <div className="container">
      <h2>Personalized Feedback</h2>
      {feedbackData.map((feedback, index) => (
        <div key={index} className="feedback-card12">
          <div className="question12">{feedback.question}</div>
          <div className="context12">{feedback.context}</div>
          <div className="answer12">{feedback.answer}</div>
          <div className="evaluation12">{feedback.evaluation}</div>
          <div className="feedback12">{feedback.feedback}</div>
        </div>
      ))}
    </div>
  );
};

export default PersonalizedFeedback;