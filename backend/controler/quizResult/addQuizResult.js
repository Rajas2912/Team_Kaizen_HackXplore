import QuizResult from "../../model/quiz.Result.js";


// Function to add quiz result
export const addQuizResult = async (req, res) => {
  try {
    const {
      quizid,
      studentId,
      studentName,
      totalQuestions,
      questionAnswerSet,
      overallMark,
      proctoredFeedback,
    } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!quizid || !studentId || !studentName || !totalQuestions || !questionAnswerSet) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new quiz result
    const newQuizResult = new QuizResult({
      quizid,
      studentId,
      studentName,
      totalQuestions,
      questionAnswerSet,
      overallMark,
      proctoredFeedback,
    });

    // Save the quiz result to the database
    const savedQuizResult = await newQuizResult.save();

    // Return the saved quiz result
    res.status(201).json(savedQuizResult);
  } catch (error) {
    console.error("Error adding quiz result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

