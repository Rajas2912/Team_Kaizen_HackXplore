import Quiz from "../../model/quiz.model.js";
export const updateQuiz = async (req, res) => {
  const { quizid } = req.params;
  console.log("quiz id,",quizid)
  const {
    quizname,
    startTime,
    duration,
    duedate,
    markperquestion,
    questionAnswerSet,
  } = req.body;
console.log(req.body);
  try {
    // Validate input data
    if (
      !quizname ||
      !startTime ||
      !duration ||
      !duedate ||
      !markperquestion ||
      !questionAnswerSet
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizid,
      {
        quizname,
        startTime,
        duration,
        duedate,
        markperquestion,
        questionAnswerSet,
      },
      { new: true } // Return the updated document
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ message: "Error updating quiz", error: error.message });
  }
};