import multer from 'multer'
import path from 'path'

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Save files in 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Unique filename
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDFs are allowed.'), false)
  }
}

// Upload middleware (Handling multiple files)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // Max 5MB per file
})

export default upload
