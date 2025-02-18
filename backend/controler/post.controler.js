import Post from '../model/post.model.js'

// Helper function to handle errors
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message })
}

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { description, classId, userId, image } = req.body

    // Validate required fields
    if (!description || !classId || !userId) {
      return handleError(
        res,
        400,
        'Description, classId, and userId are required'
      )
    }

    // Create the post with the Cloudinary image URL
    const post = new Post({
      user: userId,
      classId,
      description,
      image: image || null, // Use the Cloudinary URL if provided
    })

    const createdPost = await post.save()
    res.status(201).json({ success: true, data: createdPost })
  } catch (error) {
    console.error('Error creating post:', error)
    handleError(res, 500, 'Failed to create post')
  }
}

// Like or unlike a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params
    const { userId } = req.body

    // Validate required fields
    if (!userId) {
      return handleError(res, 400, 'UserId is required')
    }

    const post = await Post.findById(postId)
    if (!post) {
      return handleError(res, 404, 'Post not found')
    }

    // Toggle like
    const isLiked = post.likes.includes(userId)
    if (isLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      )
    } else {
      post.likes.push(userId)
    }

    await post.save()
    res.status(200).json({ success: true, data: post })
  } catch (error) {
    console.error('Error liking post:', error)
    handleError(res, 500, 'Failed to like post')
  }
}

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params
    const { text, userId } = req.body

    // Validate required fields
    if (!text || !userId) {
      return handleError(res, 400, 'Text and userId are required')
    }

    const post = await Post.findById(postId)
    if (!post) {
      return handleError(res, 404, 'Post not found')
    }

    // Add the comment
    const comment = {
      user: userId,
      text,
    }

    post.comments.push(comment)
    await post.save()

    res.status(201).json({ success: true, data: post })
  } catch (error) {
    console.error('Error adding comment:', error)
    handleError(res, 500, 'Failed to add comment')
  }
}

// Get all posts for a specific class
export const getPosts = async (req, res) => {
  try {
    const { classId } = req.params

    // Validate classId
    if (!classId) {
      return handleError(res, 400, 'ClassId is required')
    }

    const posts = await Post.find({ classId })
      .populate('user', 'name profile_pic')
      .populate('comments.user', 'name profile_pic')
      .sort('-createdAt')

    res.status(200).json({ success: true, data: posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    handleError(res, 500, 'Failed to fetch posts')
  }
}
