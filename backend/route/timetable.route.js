import express from 'express'
import {
  saveTimetable,
  getTimetableByUserId,
  deleteTimetableByUserId,
  updateScheduleItems,
} from '../controler/TimeTable.controler.js'

const router = express.Router()

router.post('/', saveTimetable)
router.get('/:userId', getTimetableByUserId)
router.delete('/:userId', deleteTimetableByUserId)
router.patch('/:userId', updateScheduleItems)

export default router
