import Class from '../model/class.model.js'
import User from '../model/user.model.js'

export const createClass = async (req, res) => {
  try {
    const { name } = req.body
    const teacherId = req.user.id // Assuming teacher is authenticated

    // Check if the user is a teacher
    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== 'teacher') {
      return res
        .status(403)
        .json({ message: 'Only teachers can create classes' })
    }

    const newClass = await Class.create({ name, teacher: teacherId })
    res
      .status(201)
      .json({ message: 'Class created successfully', classData: newClass })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}

export const joinClass = async (req, res) => {
  try {
    const { classCode } = req.body
    const studentId = req.user.id

    // Find class by classCode
    const classData = await Class.findOne({ classCode })
    if (!classData) {
      return res.status(404).json({ message: 'Invalid class code' })
    }

    // Check if student is already in the class
    if (classData.students.includes(studentId)) {
      return res.status(400).json({ message: 'You are already in this class' })
    }

    // Add student to class
    classData.students.push(studentId)
    await classData.save()

    res.status(200).json({ message: 'Joined class successfully', classData })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}

// 📌 3️⃣ Update Class (Only by Teacher)
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params
    const { name } = req.body
    const teacherId = req.user.id

    const classData = await Class.findById(classId)
    if (!classData) return res.status(404).json({ message: 'Class not found' })

    // Check if the user is the teacher of the class
    if (classData.teacher.toString() !== teacherId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this class' })
    }

    classData.name = name || classData.name
    await classData.save()

    res.status(200).json({ message: 'Class updated successfully', classData })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}

// 📌 4️⃣ Delete Class (Only by Teacher)
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params
    const teacherId = req.user.id

    const classData = await Class.findById(classId)
    if (!classData) return res.status(404).json({ message: 'Class not found' })

    // Only the class teacher can delete the class
    if (classData.teacher.toString() !== teacherId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to delete this class' })
    }

    await classData.deleteOne()

    res.status(200).json({ message: 'Class deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}

// 📌 5️⃣ Get Class Details
export const getClassDetails = async (req, res) => {
  try {
    const { classId } = req.params

    const classData = await Class.findById(classId)
      .populate('teacher', 'name email')
      .populate('students', 'name email')

    if (!classData) return res.status(404).json({ message: 'Class not found' })

    res.status(200).json({ classData })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}

export const leaveClass = async (req, res) => {
  try {
    const { classId } = req.params
    const studentId = req.user.id

    const classData = await Class.findById(classId)
    if (!classData) return res.status(404).json({ message: 'Class not found' })

    // Remove student from the class
    classData.students = classData.students.filter(
      (id) => id.toString() !== studentId
    )
    await classData.save()

    res.status(200).json({ message: 'Left the class successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}
