import express from 'express'
import {
  createClass,
  joinClass,
  updateClass,
  deleteClass,
  getClassDetails,
  leaveClass,
  getAllClasses,
  getAllStudentsWithClassInfo,
} from '../controler/class.controller.js'
import { authenticate } from '../middlewares/authMiddleware.js' // Assuming authentication

const router = express.Router()

router.post('/create', authenticate, createClass)
router.post('/getAllClasses', authenticate, getAllClasses)
router.get('/students', getAllStudentsWithClassInfo)
router.post('/join', authenticate, joinClass)
router.put('/update/:classId', authenticate, updateClass) // Update class (Teacher only)
router.delete('/delete/:classId', authenticate, deleteClass) // Delete class (Teacher only)
router.get('/:classId', authenticate, getClassDetails) // Get class details
router.put('/leave/:classId', authenticate, leaveClass) // Leave class (Student)

export default router
