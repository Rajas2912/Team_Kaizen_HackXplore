import express from 'express'
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
  getAssignmentsByStudentId,getStudentAssignmentResult,
  getSubmissionResult,
  storeFeedback,
  getFeedback,
  getSubmissionFeedback
} from '../controler/assignment.controler.js'
import upload from '../middlewares/upload.js'
import multer from 'multer'
import path from 'path' // Import the path module

const router = express.Router()

// Create a new assignment (with file uploads)
router.post(
  '/upload',
  upload.fields([{ name: 'chapterPdf' }, { name: 'assignmentPdf' }]),
  createAssignment
)

router.get('/result/:assignmentId/:studentId', getSubmissionResult);

// Get assignments by class ID
router.get('/class/:classId', getAssignmentsByClass)

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Specify the directory where files should be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Rename the file to avoid conflicts
  },
})



// Initialize Multer with the storage engine
const upload2 = multer({ storage: storage })

// Submit an answer for an assignment (with file upload)
router.post(
  '/submit-answer',
  upload2.single('answerFile'), // Use upload.single for a single file upload
  submitAnswer
)

// Get submissions for an assignment
router.get('/submissions/:assignmentId', getSubmissions)

router.get('/getStudentAssignmentResult', getStudentAssignmentResult)


router.post('/store-feedback', storeFeedback);

// Backend route to check if feedback exists
router.get('/feedback/:assignmentId/:studentId', getFeedback);
router.get('/feedback-exists/:assignmentId/:studentId', async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      'submissions.studentId': req.params.studentId,
      'submissions.feedback': { $ne: null }
    });
    
    res.json({ exists: !!assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update an assignment (with file uploads)
router.put(
  '/:assignmentId',
  upload.fields([{ name: 'chapterPdf' }, { name: 'assignmentPdf' }]),
  updateAssignment
)

// Delete an assignment
router.delete('/:assignmentId', deleteAssignment)

// Update the result for a submission
router.put('/:assignmentId/result', updateSubmissionResult)

// Get all assignments with submissions for a teacher (by class ID)
router.get('/teacher/:classId', getAssignmentsWithSubmissions)

// Get assignments with submissions by assignment ID
router.get(
  '/teacher/assignment/:assignmentId',
  getAssignmentsWithSubmissionsByAssignmentId
)

// get result of assignement using studentid 
router.get('/:studentId',getAssignmentsByStudentId);



export default router
