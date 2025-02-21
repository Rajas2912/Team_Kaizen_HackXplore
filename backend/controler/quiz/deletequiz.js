import Quiz from "../../model/quiz.model";
export const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
  
    try {
      const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
      if (!deletedQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting quiz", error: error.message });
    }
  };