import Comment from '../model/comment.model.js  '

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { lectureId, userId, text } = req.body

    if (!lectureId || !userId || !text) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const newComment = new Comment({ lectureId, userId, text })
    await newComment.save()

    res
      .status(201)
      .json({ message: 'Comment created successfully', comment: newComment })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all comments for a lecture, sorted by latest first
export const getCommentsByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params

    const comments = await Comment.find({ lectureId })
      .sort({ createdAt: -1 }) // Sort by latest first
      .populate('userId', 'name email') // Populate user details (optional)

    res.status(200).json({ comments })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ message: 'Text is required' })
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true } // Return the updated comment
    )

    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
