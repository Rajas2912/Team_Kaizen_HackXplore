// routes/commentRoutes.js
import express from 'express'
import {
  createComment,
  getCommentsByLecture,
  updateComment,
  deleteComment,
} from '../controler/comment.controller.js'

const router = express.Router()

// Create a new comment
router.post('/comments', createComment)

// Get all comments for a lecture
router.get('/lectures/:lectureId/comments', getCommentsByLecture)

// Update a comment
router.put('/comments/:commentId', updateComment)

// Delete a comment
router.delete('/comments/:commentId', deleteComment)

export default router
