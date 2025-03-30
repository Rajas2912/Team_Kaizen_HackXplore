import Project from '../model/Project.js';
import User from '../model/user.model.js';

// Get all teachers (for student to request guidance)
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student requests teacher for guidance
export const requestGuidance = async (req, res) => {
  try {
    const { teacherId, studentId, title, description, studentRequest, githubRepo, googleDocId } = req.body;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Extract Google Doc ID if provided
    let extractedDocId = '';
    if (googleDocId) {
      // Handle both full URLs and direct IDs
      const match = googleDocId.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/) || 
                    googleDocId.match(/^([a-zA-Z0-9_-]+)$/);
      if (match) {
        extractedDocId = match[1];
      } else {
        return res.status(400).json({ message: 'Invalid Google Docs URL format' });
      }
    }

    // Create new project request
    const project = new Project({
      title,
      description,
      teacher: teacherId,
      student: studentId,
      studentRequest,
      githubRepo: githubRepo || '',
      googleDocId: extractedDocId
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's projects
export const getStudentProjects = async (req, res) => {
  try {
    const { studentId } = req.params;
    const projects = await Project.find({ student: studentId })
      .populate('teacher', 'name email profile_pic')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's project requests
export const getTeacherRequests = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const projects = await Project.find({ teacher: teacherId })
      .populate('student', 'name email profile_pic')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Teacher responds to student request
export const respondToRequest = async (req, res) => {
  try {
    const { projectId, status, teacherResponse, googleDocId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    project.teacherResponse = teacherResponse;
    
    if (status === 'accepted' && googleDocId) {
      // Validate and extract Google Doc ID
      const match = googleDocId.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/) || 
                    googleDocId.match(/^([a-zA-Z0-9_-]+)$/);
      if (match) {
        project.googleDocId = match[1];
      } else {
        return res.status(400).json({ message: 'Invalid Google Docs URL format' });
      }
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};