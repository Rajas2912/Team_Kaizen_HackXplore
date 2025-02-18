import mongoose from "mongoose";

const ProctoredFeedbackSchema = new mongoose.Schema({
    phoneDetectedCount: { type: Number, default: 0 },       
    cameraDetectedCount: { type: Number, default: 0 },     
    bookDetectedCount: { type: Number, default: 0 },        
    multipleUsersDetectedCount: { type: Number, default: 0 }, 
    tabSwitchingDetectedCount: { type: Number, default: 0 } 
});

const QuestionAnswerSetSchema = new mongoose.Schema({
    questionText: { type: String, required: true },   // Question asked
    modelAnswer: { type: String, required: true },    // Expected answer
    studentAnswer: { type: String, required: true },  // Student's response
    evalution: { type: String, required: true }  
});

const VivaResultSchema = new mongoose.Schema({
    vivaId: { type: mongoose.Schema.Types.ObjectId, ref: "Viva", required: true }, // Reference to Viva
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to Student
    studentName: { type: String, required: true },
    totalQuestions: { type: Number, required: true }, // Number of questions in the Viva
    questionAnswerSet: [QuestionAnswerSetSchema],    // Array of Question-Answer pairs
    overallMark: { type: Number, required: true },   // Total marks obtained
    dateOfViva: { type: Date, default: Date.now },   // Date when the viva was given
    proctoredFeedback: ProctoredFeedbackSchema       // Feedback on exam integrity
});

const VivaResult = mongoose.model("VivaResult", VivaResultSchema);
export default VivaResult;
