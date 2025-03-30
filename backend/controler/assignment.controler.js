import Assignment from '../model/assignment.model.js'
import mongoose from 'mongoose'

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, classId, deadline } = req.body
    const chapterPdf = req.files?.chapterPdf
      ? `${req.files.chapterPdf[0].filename}`
      : null
    const assignmentPdf = req.files?.assignmentPdf
      ? `${req.files.assignmentPdf[0].filename}`
      : null

    const newAssignment = new Assignment({
      title,
      description,
      classId,
      chapterPdf,
      assignmentPdf,
      deadline,
    })

    await newAssignment.save()
    res.status(201).json(newAssignment)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating assignment', error: error.message })
  }
}

export const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params
    const assignments = await Assignment.find({ classId }).sort({
      createdAt: -1,
    })
    res.status(200).json(assignments)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching assignments', error: error.message })
  }
}

export const submitAnswer = async (req, res) => {
  try {
    const { assignmentId, studentId, results, total_score, plagiarismScore } =
      req.body;
    const answerFile = req.file?.filename;

    const submission = {
      studentId: new mongoose.Types.ObjectId(studentId),
      answerFile,
      result: {
        results,
        total_score,
      },
      plagiarismScore,
      feedback: null, // Initialize feedback fields
      feedbackGeneratedAt: null
    };

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.submissions.push(submission);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error submitting answer', error: error.message });
  }
};

// Get submissions for an assignment
export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId).populate(
      'submissions.studentId',
      'name email'
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Map submissions to include feedback information
    const submissionsWithFeedback = assignment.submissions.map(sub => ({
      ...sub.toObject(),
      hasFeedback: sub.feedback !== null,
      feedbackGeneratedAt: sub.feedbackGeneratedAt
    }));
    
    res.status(200).json(submissionsWithFeedback);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching submissions', error: error.message });
  }
};

// Update an assignment
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { title, description, classId, deadline } = req.body
    const chapterPdf = req.files?.chapterPdf
      ? `${req.files.chapterPdf[0].filename}`
      : null
    const assignmentPdf = req.files?.assignmentPdf
      ? `${req.files.assignmentPdf[0].filename}`
      : null

    const updateData = {
      title,
      description,
      classId,
      deadline,
      ...(chapterPdf && { chapterPdf }),
      ...(assignmentPdf && { assignmentPdf }),
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true }
    )
    if (!updatedAssignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }
    res.status(200).json(updatedAssignment)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating assignment', error: error.message })
  }
}

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId)
    if (!deletedAssignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }
    res.status(200).json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting assignment', error: error.message })
  }
}

// Update the result for a submission
export const updateSubmissionResult = async (req, res) => {
  try {
    const { assignmentId, studentId, results, total_score, plagiarismScore } =
      req.body

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    const submission = assignment.submissions.find(
      (sub) => sub.studentId.toString() === studentId
    )
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    submission.result = { results, total_score, plagiarismScore }
    await assignment.save()

    res.status(200).json(assignment)
  } catch (error) {
    res.status(500).json({
      message: 'Error updating submission result',
      error: error.message,
    })
  }
}

// Get all assignments with submissions for a teacher
export const getAssignmentsWithSubmissions = async (req, res) => {
  try {
    const { classId } = req.params

    const assignments = await Assignment.find({ classId })
      .populate('submissions.studentId', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json(assignments)
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignments with submissions',
      error: error.message,
    })
  }
}

// Get assignments with submissions by assignment ID
export const getAssignmentsWithSubmissionsByAssignmentId = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await Assignment.findById(assignmentId)
      .populate('submissions.studentId', 'name email')
      .sort({ createdAt: -1 })

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    res.status(200).json(assignment)
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignment with submissions',
      error: error.message,
    })
  }
}

export const getStudentAssignmentResult = async (req, res) => {
  try {
    const { studentId, assignmentId } = req.body;

    // Step 1: Find the assignment by assignmentId
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Step 2: Find the submission for the specific student in the assignment
    const submission = assignment.submissions.find(
      (sub) => sub.studentId.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found for the student' });
    }

    // Step 3: Return the result of the submission
    res.status(200).json({
      assignmentId: assignment._id,
      studentId: submission.studentId,
      result: submission.result,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching student assignment result',
      error: error.message,
    });
  }
};

export const getAssignmentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(studentId)
    // Step 1: Find all assignments where the submissions array contains the studentId
    const assignments = await Assignment.find({
      'submissions.studentId': studentId,
    });

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ message: 'No assignments found for the student' });
    }

    // Step 2: Fetch class details for each assignment and combine the results
    const assignmentsWithClassDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const classDetails = await Class.findById(assignment.classId); // Fetch class details using classId
        return {
          ...assignment.toObject(), // Convert Mongoose document to plain object
          classDetails: classDetails || null, // Include class details
        };
      })
    );

    res.status(200).json(assignmentsWithClassDetails);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching assignments with submissions and class details',
      error: error.message,
    });
  }
};
export const getSubmissionResult = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.find(
      (sub) => sub.studentId.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found for the student' });
    }

    res.status(200).json({
      assignmentId: assignment._id,
      studentId: submission.studentId,
      result: submission.result,
      assignmentTitle: assignment.title,
      feedback: submission.feedback, // Include feedback in response
      feedbackGeneratedAt: submission.feedbackGeneratedAt // Include feedback timestamp
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching submission result',
      error: error.message,
    });
  }
};

export const storeFeedback = async (req, res) => {
  try {
    const { assignmentId, studentId, feedbackData } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: assignmentId,
        'submissions.studentId': studentId
      },
      {
        $set: {
          'submissions.$.feedback': feedbackData,
          'submissions.$.feedbackGeneratedAt': new Date()
        }
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment or submission not found' });
    }

    res.status(200).json({ 
      message: 'Feedback stored successfully', 
      feedback:feedbackData 
    });
  } catch (error) {
    console.error('Error storing feedback:', error);
    res.status(500).json({ 
      message: 'Failed to store feedback', 
      error: error.message 
    });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    
    const assignment = await Assignment.findOne({
      _id: assignmentId
    }).lean(); // Using lean() for better performance

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Find the specific submission
    const submission = assignment.submissions.find(
      sub => sub.studentId.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (!submission.feedback) {
      return res.status(404).json({ 
        message: 'No feedback found for this submission',
        feedback: null
      });
    }

    res.status(200).json({
      message: 'Feedback retrieved successfully',
      feedback: submission.feedback
    });

  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ 
      message: 'Failed to fetch feedback', 
      error: error.message 
    });
  }
};

export const getSubmissionFeedback = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    
    // Find the assignment with the matching submission
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      'submissions.studentId': studentId
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Manually find the submission
    const submission = assignment.submissions.find(
      sub => sub.studentId.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if results exist in the submission
    if (!submission.result || !submission.result.results) {
      return res.status(404).json({ 
        message: 'No result data found for this submission',
        results: null
      });
    }

    let resultsArray;
    
    // First parse the outer JSON string if it exists
    const initialParse = typeof submission.result.results === 'string' 
      ? JSON.parse(submission.result.results) 
      : submission.result.results;

    // Then check if the parsed result contains another stringified array
    if (typeof initialParse.results === 'string') {
      resultsArray = JSON.parse(initialParse.results);
    } 
    // Or if it's already the array we want
    else if (Array.isArray(initialParse.results)) {
      resultsArray = initialParse.results;
    }
    // Or if it's just a direct array
    else if (Array.isArray(initialParse)) {
      resultsArray = initialParse;
    }
    // Otherwise use whatever we have
    else {
      resultsArray = [initialParse];
    }

    // Ensure all elements in the array are properly parsed
    const finalResults = resultsArray.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return item;
    });

    res.status(200).json({
      message: 'Results retrieved successfully',
      results: finalResults,
      totalScore: submission.result.total_score
    });

  } catch (error) {
    console.error('Error in getSubmissionFeedback:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submission results', 
      error: error.message 
    });
  }
};
