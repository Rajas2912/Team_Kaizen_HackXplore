import Class from '../model/class.model.js'
import User from '../model/user.model.js'

export const createClass = async (req, res) => {
  try {
    const { name, description, subject, userId } = req.body
    console.log({ body: req.body })

    const teacher = await User.findById(userId)
    if (!teacher || teacher.role !== 'teacher') {
      return res
        .status(403)
        .json({ message: 'Only teachers can create classes' })
    }

    // Generate a unique class code (e.g., random 6-character alphanumeric string)
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const newClass = await Class.create({
      name,
      description,
      subject,
      teacher: userId,
      classCode, // 🔥 Add this line
    })

    res
      .status(201)
      .json({ message: 'Class created successfully', classData: newClass })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server Error', error })
  }
}

export const joinClass = async (req, res) => {
  try {
    const { classCode, studentId } = req.body

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
    console.log(error)
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
    const teacherId = req.body.teacherId
    // console.log(classId)
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
    const { studentId } = req.body // Extract from body, not params

    const classData = await Class.findById(classId)
    if (!classData) return res.status(404).json({ message: 'Class not found' })

    // Remove student from the class
    classData.students = classData.students.filter(
      (id) => id.toString() !== studentId
    )
    await classData.save()

    res.status(200).json({ message: 'Left the class successfully' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server Error', error })
  }
}
export const getAllClasses = async (req, res) => {
  try {
    const { userId } = req.body
    console.log(userId)

    let query = {}
    if (userId) {
      query = {
        $or: [{ teacher: userId }, { students: { $in: [userId] } }],
      }
    }

    const classes = await Class.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email')

    res.status(200).json({ classes })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server Error', error })
  }
}

export const getAllStudentsWithClassInfo = async (req, res) => {
  try {
    // Find all classes and populate the 'students' field with user details
    const classes = await Class.find({})
      .populate({
        path: 'students',
        select: 'name email', // Only select name and email fields from the User model
      })
      .select('name students') // Only select class name and students array

    // Format the response to include student details and class name
    const result = classes.flatMap((cls) =>
      cls.students.map((student) => ({
        studentName: student.name,
        studentEmail: student.email,
        className: cls.name,
      }))
    )

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching students with class info:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students with class info',
    })
  }
}
