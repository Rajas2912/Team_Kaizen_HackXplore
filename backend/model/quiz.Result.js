import mongoose from "mongoose";

const ProctoredFeedbackSchema = new mongoose.Schema({
    phoneDetectedCount: { type: Number, default: 0 },       
    laptopDetectedCount: { type: Number, default: 0 },     
    bookDetectedCount: { type: Number, default: 0 },        
    multipleUsersDetectedCount: { type: Number, default: 0 }, 
    tabSwitchingDetectedCount: { type: Number, default: 0 } 
});

const QuestionAnswerSetSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [String], // Optional: For multiple-choice questions
    correctoption: { type: String, required: true },
    studentAnswer:{ type: String}
  });

const quizResultSchema = new mongoose.Schema({
    quizid: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true }, // Reference to Viva
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to Student
    studentName: { type: String, required: true },
    totalQuestions: { type: Number, required: true }, // Number of questions in the Viva
    questionAnswerSet: [QuestionAnswerSetSchema],    // Array of Question-Answer pairs
    overallMark: { type: Number },   // Total marks obtained
    dateofquiz: { type: Date, default: Date.now },   // Date when the viva was given
    proctoredFeedback: ProctoredFeedbackSchema       // Feedback on exam integrity
});

const QuizResult = mongoose.model("quizResultSchema", quizResultSchema);
export default QuizResult;
