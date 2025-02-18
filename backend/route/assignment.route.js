import express from 'express'
import {
  createAssignment,
  getAssignmentsByClass,
  submitAnswer,
  getSubmissions,
  deleteAssignment,
  updateAssignment,
} from '../controler/assignment.controler.js'
import upload from '../middlewares/upload.js'

const router = express.Router()

router.post(
  '/upload',
  upload.fields([{ name: 'chapterPdf' }, { name: 'assignmentPdf' }]),
  createAssignment
)
router.get('/class/:classId', getAssignmentsByClass)
router.post('/submit-answer', upload.single('answerFile'), submitAnswer)
router.get('/submissions/:assignmentId', getSubmissions)
router.put(
  '/:assignmentId',
  upload.fields([{ name: 'chapterPdf' }, { name: 'assignmentPdf' }]),
  updateAssignment
)
router.delete('/:assignmentId', deleteAssignment)

export default router
