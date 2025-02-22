import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answerFile: { type: String, required: true },
  plagiarismScore: { type: Number, default: 0 },
  isConfirmed: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now }, // Timestamp of submission
  result: {
    results: [{ type: mongoose.Schema.Types.Mixed }], // Array of results
    total_score: { type: Number, default: 0 }, // Total score
  },
})

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // New description field
  classId: { type: String, required: true },
  chapterPdf: { type: String, required: true },
  assignmentPdf: { type: String, required: true },
  deadline: { type: Date, required: true }, // Deadline for the assignment
  submissions: [SubmissionSchema], // Array of submissions
  createdAt: { type: Date, default: Date.now }, // Timestamp of assignment creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
})

// Middleware to update the 'updatedAt' field before saving
AssignmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Assignment', AssignmentSchema)
