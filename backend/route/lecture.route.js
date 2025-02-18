import express from 'express'
import multer from 'multer'
import {
  uploadLecture,
  getLecturesByClass,
  getLectureById,
  deleteLecture,
} from '../controler/lecture.controler.js'

const router = express.Router()

// Multer middleware for file upload
const upload = multer({ dest: 'uploads/lectures/' })

// Routes
router.post('/upload', upload.single('video'), uploadLecture)
router.get('/class/:classId', getLecturesByClass)
router.get('/:lectureId', getLectureById)
router.delete('/:lectureId', deleteLecture)

export default router
