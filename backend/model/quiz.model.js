import mongoose from "mongoose";
const quizSchema = mongoose.Schema(
  {
    classid: {
      type: String,
    },
    quizname: {
      type: String,
      required: [true, "provide name"],
    },
    startTime: {
      type: Date,
      required: [true, "provide date and time "],
    },
    duration: {
      type: Number,
      required: [true, "provide time in minute"],
    },
    duedate: {
      type: Date,
      required: [true, "provide date"],
    },
    markperquestion: {
      type: Number,
      required: [true, "provide mark for each question "],
    },
    questionAnswerSet: [
      {
        questionText: { type: String, required: true },
        options: [String], // Optional: For multiple-choice questions
        correctoption: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
