import express from 'express';
import {
  createAssignment,
  getAssignmentsByClass,
  submitAnswer,
  getSubmissions,
  deleteAssignment,
  updateAssignment,
  updateSubmissionResult,
  getAssignmentsWithSubmissions,
  getAssignmentsWithSubmissionsByAssignmentId,
} from '../controller/assignment.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Create a new assignment (with file uploads)
router.post(
  '/upload',
  upload.fields([{ name: 'chapterPdf' }, { name: 'assignmentPdf' }]),
  createAssignment
);

// Get assignments by class ID
router.get('/class/:classId', getAssignmentsByClass);

// Submit an answer for an assignment (with file upload)
router.post('/submit-answer', upload.single('answerFile'), submitAnswer);

// Get submissions for an assignment
router.get('/submissions/:assignmentId', getSubmissions);

// Update an assignment (with file uploads)
router.put(
  '/:assignmentId',
  upload.fields([{ name: 'chapterPdf' }, { name: 'assignmentPdf' }]),
  updateAssignment
);

// Delete an assignment
router.delete('/:assignmentId', deleteAssignment);

// Update the result for a submission
router.put('/:assignmentId/result', updateSubmissionResult);

// Get all assignments with submissions for a teacher (by class ID)
router.get('/teacher/:classId', getAssignmentsWithSubmissions);

// Get assignments with submissions by assignment ID
router.get('/teacher/assignment/:assignmentId', getAssignmentsWithSubmissionsByAssignmentId);

export default router;