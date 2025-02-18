import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Alert,
  Card,
  CardContent,
  Avatar,
  TextField,
  useTheme,
  Collapse,
} from '@mui/material'
import { motion } from 'framer-motion'
import { styled } from '@mui/system'
import {
  useCreatePostMutation,
  useAddCommentMutation,
  useGetPostsByClassQuery,
  useLikePostMutation,
} from '../../redux/api/postApiSlice'
import { BASE_URL } from '../../redux/constants'
import { useSelector } from 'react-redux'
import SendIcon from '@mui/icons-material/Send'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CommentIcon from '@mui/icons-material/Comment'
import CloseIcon from '@mui/icons-material/Close'
import { uploadfile } from '../../helper/UploadonCLoud'

// Custom styled components with blue theme
const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  border: 0,
  borderRadius: 15,
  color: 'white',
  padding: '10px 20px',
  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}))

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 10,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}))

const CommunityPage = ({ classId }) => {
  const { userInfo } = useSelector((state) => state.user)
  const [openDialog, setOpenDialog] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [openComments, setOpenComments] = useState({})
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const theme = useTheme()

  // RTK Query hooks
  const { data: posts, isLoading, refetch } = useGetPostsByClassQuery(classId)
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()
  const [likePost, { isLoading: isLiking }] = useLikePostMutation()
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation()

  console.log('Posts data:', posts) // Debugging: Log the posts data

  // Handle post creation
  const handleCreatePost = async () => {
    if (!postContent) {
      setNotification({
        open: true,
        message: 'Please write something to post.',
        severity: 'error',
      })
      return
    }

    let imageUrl = null
    if (selectedImage) {
      try {
        const cloudinaryResponse = await uploadfile(selectedImage) // Upload to Cloudinary
        imageUrl = cloudinaryResponse.url
      } catch (error) {
        setNotification({
          open: true,
          message: 'Failed to upload image.',
          severity: 'error',
        })
        return
      }
    }

    try {
      await createPost({
        description: postContent,
        classId,
        userId: userInfo._id,
        image: imageUrl,
      }).unwrap()

      setNotification({
        open: true,
        message: 'Post created successfully!',
        severity: 'success',
      })
      setOpenDialog(false)
      setPostContent('')
      setSelectedImage(null)
      refetch()
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || 'Failed to create post.',
        severity: 'error',
      })
    }
  }

  // Handle post like
  const handleLikePost = async (postId) => {
    try {
      await likePost({ postId, userId: userInfo._id }).unwrap()
      refetch()
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || 'Failed to like post.',
        severity: 'error',
      })
    }
  }

  // Handle comment addition
  const handleAddComment = async (postId) => {
    if (!commentContent) {
      setNotification({
        open: true,
        message: 'Please write a comment.',
        severity: 'error',
      })
      return
    }

    try {
      await addComment({
        postId,
        text: commentContent,
        userId: userInfo._id,
      }).unwrap()
      setCommentContent('')
      refetch()
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || 'Failed to add comment.',
        severity: 'error',
      })
    }
  }

  // Toggle comments visibility
  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <Box sx={{ p: 3, background: theme.palette.background.default }}>
      {/* Page Header */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
      >
        Community
      </Typography>

      {/* Create Post Button */}
      <StyledButton
        startIcon={<SendIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Create New Post
      </StyledButton>

      {/* Posts List */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box>
          {posts?.data?.map(
            (
              post // Use optional chaining and fallback to an array
            ) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StyledCard>
                  <CardContent>
                    {/* Post Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        src={`${BASE_URL}/uploads/${post.user.profile_pic}`}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {post.user.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Post Content */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {post.description}
                    </Typography>

                    {/* Post Image */}
                    {post.image && (
                      <Box
                        component="img"
                        src={`${post.image}`}
                        alt="Post"
                        sx={{ width: '100%', borderRadius: 2, mb: 2 }}
                      />
                    )}

                    {/* Post Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton onClick={() => handleLikePost(post._id)}>
                        <FavoriteIcon
                          sx={{
                            color: post.likes.includes(userInfo._id)
                              ? 'red'
                              : 'inherit',
                          }}
                        />
                        <Typography sx={{ ml: 1 }}>
                          {post.likes.length}
                        </Typography>
                      </IconButton>
                      <IconButton onClick={() => toggleComments(post._id)}>
                        <CommentIcon />
                        <Typography sx={{ ml: 1 }}>
                          {post.comments.length}
                        </Typography>
                      </IconButton>
                    </Box>

                    {/* Comments Section */}
                    <Collapse in={openComments[post._id]}>
                      <Box sx={{ mt: 2 }}>
                        {post.comments.map((comment) => (
                          <Box
                            key={comment._id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Avatar
                              src={`${BASE_URL}/uploads/${comment.user.profile_pic}`}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 'bold' }}
                              >
                                {comment.user.name}
                              </Typography>
                              <Typography variant="body2">
                                {comment.text}
                              </Typography>
                            </Box>
                          </Box>
                        ))}

                        {/* Add Comment */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mt: 2,
                          }}
                        >
                          <Avatar
                            src={`${BASE_URL}/uploads/${userInfo.profile_pic}`}
                            sx={{ width: 24, height: 24 }}
                          />
                          <TextField
                            fullWidth
                            placeholder="Add a comment..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            size="small"
                          />
                          <IconButton
                            onClick={() => handleAddComment(post._id)}
                          >
                            <SendIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </StyledCard>
              </motion.div>
            )
          )}
        </Box>
      )}

      {/* Create Post Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            sx={{ mt: 2 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <StyledButton onClick={handleCreatePost} disabled={isCreating}>
            {isCreating ? <CircularProgress size={24} /> : 'Post'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CommunityPage
