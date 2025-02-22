import Timetable from '../model/TimeTable.js'

// Helper function to handle errors
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message })
}

// Save or update a timetable
export const saveTimetable = async (req, res) => {
  try {
    const { userId, schedule } = req.body

    // Validate required fields
    if (!userId || !schedule) {
      return handleError(res, 400, 'UserId and schedule are required')
    }

    // Check if the schedule is an array
    if (!Array.isArray(schedule)) {
      return handleError(res, 400, 'Schedule must be an array')
    }

    // Validate each schedule item
    for (const item of schedule) {
      if (!item.date || !item.day || !item.hours || !item.topic) {
        return handleError(
          res,
          400,
          'Each schedule item must have date, day, hours, and topic'
        )
      }
    }

    // Create or update the timetable
    const timetable = await Timetable.findOneAndUpdate(
      { userId },
      { schedule },
      { new: true, upsert: true }
    )

    res.status(200).json({ success: true, data: timetable })
  } catch (error) {
    console.error('Error saving timetable:', error)
    handleError(res, 500, 'Failed to save timetable')
  }
}

// Get timetable by user ID
export const getTimetableByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    // Validate userId
    if (!userId) {
      return handleError(res, 400, 'UserId is required')
    }

    const timetable = await Timetable.findOne({ userId })

    if (!timetable) {
      return handleError(res, 404, 'Timetable not found')
    }

    res.status(200).json({ success: true, data: timetable })
  } catch (error) {
    console.error('Error fetching timetable:', error)
    handleError(res, 500, 'Failed to fetch timetable')
  }
}

// Delete timetable by user ID
export const deleteTimetableByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    // Validate userId
    if (!userId) {
      return handleError(res, 400, 'UserId is required')
    }

    const deletedTimetable = await Timetable.findOneAndDelete({ userId })

    if (!deletedTimetable) {
      return handleError(res, 404, 'Timetable not found')
    }

    res
      .status(200)
      .json({ success: true, message: 'Timetable deleted successfully' })
  } catch (error) {
    console.error('Error deleting timetable:', error)
    handleError(res, 500, 'Failed to delete timetable')
  }
}

// Update specific schedule items in a timetable
export const updateScheduleItems = async (req, res) => {
  try {
    const { userId } = req.params
    const { updates } = req.body

    // Validate userId and updates
    if (!userId || !updates) {
      return handleError(res, 400, 'UserId and updates are required')
    }

    // Find the timetable
    const timetable = await Timetable.findOne({ userId })

    if (!timetable) {
      return handleError(res, 404, 'Timetable not found')
    }

    // Apply updates to the schedule
    timetable.schedule = updates
    await timetable.save()

    res.status(200).json({ success: true, data: timetable })
  } catch (error) {
    console.error('Error updating timetable:', error)
    handleError(res, 500, 'Failed to update timetable')
  }
}
