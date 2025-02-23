import QuizResult from "../../model/quiz.Result.js";

export const getQuizResultsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log("Fetching quiz results for studentId:", studentId);

        // Populate the 'quizid' field with specific fields ('quizname' and 'duedate') from the 'Quiz' model
        const quizResults = await QuizResult.find({ studentId }).populate('quizid', 'quizname duedate');

        console.log("Quiz results found:", quizResults);

        if (!quizResults || quizResults.length === 0) {
            return res.status(404).json({ message: "No quiz results found for the student" });
        }

        res.status(200).json(quizResults);
    } catch (error) {
        console.error("Error fetching quiz results:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};