import VivaResult from "../../model/vivaResult.model.js";

export const addVivaResult = async (req, res) => {
    try {
        const { vivaId, studentId, studentName, totalQuestions, questionAnswerSet, overallMark, proctoredFeedback } = req.body;

        if (!vivaId || !studentId || !studentName || !totalQuestions || !questionAnswerSet || !overallMark) {
            return res.status(400).json({ message: "Missing required fields", success: false });
        }

        const newVivaResult = new VivaResult({
            vivaId,
            studentId,
            studentName,
            totalQuestions,
            questionAnswerSet,
            overallMark,
            proctoredFeedback
        });

        const savedVivaResult = await newVivaResult.save();

        res.status(201).json({
            message: "Viva result saved successfully",
            data: savedVivaResult,
            success: true
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
