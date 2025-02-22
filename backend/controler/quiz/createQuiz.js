import Quiz from "../../model/quiz.model.js";
export const createQuiz = async (req, res) => {
  const { quizname, classid, questionAnswerSet, duedate,markperquestion, startTime, duration } =
    req.body;
  try {
    const newquiz = await new Quiz({
    classid,
      quizname,
      startTime,
      duration,
      markperquestion,
      duedate,
      questionAnswerSet,
    });
    await newquiz.save();
    console.log(newquiz);
    return res.status(201).json({
      message: "Viva created successfully",
      data: newquiz,
      succes: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating quiz", error });
  }
};
