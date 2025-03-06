import express from 'express'
import { getDueDatesForStudent } from '../controler/dashboard/getduedates.js'
const router = express.Router();
 // Endpoint to get due dates for a student

router.get("/getduedate/:studentId", getDueDatesForStudent)
  
export default router;