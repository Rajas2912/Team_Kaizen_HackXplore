import QuizResult from "../../model/quiz.Result.js";

export const getQuizResultsByQuizId = async (req, res) => {
    try {
      const { quizid } = req.params;
  
    //   // Validate quizId
    //   if (!mongoose.Types.ObjectId.isValid(quizId)) {
    //     return res.status(400).json({ message: "Invalid quiz ID" });
    //   }
  
      // Find all quiz results for the given quizId
      const quizResults = await QuizResult.find({ quizid });
  
      // If no results are found, return a 404 error
      if (!quizResults || quizResults.length === 0) {
        return res.status(404).json({ message: "No quiz results found for this quiz ID" });
      }
  
      // Return the quiz results
      res.status(200).json(quizResults);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  