import Quiz from "../../model/quiz.model.js";
export const getquizbyquizid=async(req,res)=>{
    const quizid=req.params.quizid;

    // if (!mongoose.Types.ObjectId.isValid(quizId)) {
    //     return res.status(400).json({ message: "Invalid quiz ID" });
    //   }
  
      // Find the quiz by ID
      const quiz = await Quiz.findById(quizid);
  
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
  
      // Return the quiz data
      res.status(200).json(quiz);
}