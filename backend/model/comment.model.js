// models/Comment.js
import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture', // Reference to the Lecture model
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster querying by lectureId and sorting by createdAt
commentSchema.index({ lectureId: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)
