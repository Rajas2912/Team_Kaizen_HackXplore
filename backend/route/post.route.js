import express from 'express'
import {
  createPost,
  likePost,
  addComment,
  getPosts,
} from '../controler/post.controler.js'
import { authenticate } from '../middlewares/authMiddleware.js' // Assuming you have authentication middleware

// Assuming you have a file upload utility

const router = express.Router()

// Create a post (requires authentication and file upload middleware)
router.post('/', authenticate, createPost)

// Like a post (requires authentication)
router.put('/:postId/like', authenticate, likePost)

// Add a comment to a post (requires authentication)
router.post('/:postId/comment', authenticate, addComment)

// Get all posts for a specific class (requires authentication)
router.get('/:classId', authenticate, getPosts)

export default router
