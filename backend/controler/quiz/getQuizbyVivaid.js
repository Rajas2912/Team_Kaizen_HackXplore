import Quiz from "../../model/quiz.model.js";
export const getQuizbyid = async (req, res) => {
    try {
        const { classid } = req.params; // Get viva ID from request params
        console.log("classid:",classid);
        const quiz = await Quiz.find({classid}); // Fetch viva by ID
        if (quiz.length===0) {
            return res.status(404).json({
                 message: "quiz  not found",
                 succes:false,
                });
        }
        res.status(200).json(quiz); 
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
