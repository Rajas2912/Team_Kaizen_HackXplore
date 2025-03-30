import express from 'express';
import {
  requestGuidance,
  respondToRequest,
  getAllTeachers,
  getStudentProjects,
  getTeacherRequests
} from '../controler/projectController.js';

const router = express.Router();

// Student routes
router.get('/teachers', getAllTeachers);
router.post('/request', requestGuidance);
router.get('/student-projects/:studentId', getStudentProjects);

// Teacher routes
router.get('/teacher-requests/:teacherId', getTeacherRequests);
router.post('/respond', respondToRequest);

export default router;