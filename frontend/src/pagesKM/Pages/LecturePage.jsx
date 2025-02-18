import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Card,
  CardMedia,
  CardContent,
  Button,
  ListItemSecondaryAction,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  useGetLectureByIdQuery,
  useGetLecturesByClassQuery,
} from '../../redux/api/lectureApiSlice'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SendIcon from '@mui/icons-material/Send'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsByLectureQuery,
  useUpdateCommentMutation,
} from '../../redux/api/commentApiSlice'
import { useSelector } from 'react-redux'

const LecturePage = () => {
  const { id } = useParams()
  const { userInfo } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Lecture data
  const { data, isLoading: lectureLoading } = useGetLectureByIdQuery(id)
  const { data: lecturesData } = useGetLecturesByClassQuery(
    data?.lecture?.classId
  )

  // Comments functionality
  const { data: commentsData, isLoading: commentsLoading } =
    useGetCommentsByLectureQuery(id)
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation()
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation()
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation()

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity })
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      try {
        await createComment({
          lectureId: id,
          text: commentText,
          userId: userInfo._id, // Replace with actual user ID
        }).unwrap()
        setCommentText('')
        showNotification('Comment added successfully!')
      } catch (error) {
        console.error('Error creating comment:', error)
        showNotification('Failed to add comment', 'error')
      }
    }
  }

  const handleUpdateComment = async (commentId) => {
    try {
      await updateComment({
        commentId,
        text: editedText,
      }).unwrap()
      setEditingCommentId(null)
      setEditedText('')
      showNotification('Comment updated successfully!')
    } catch (error) {
      console.error('Error updating comment:', error)
      showNotification('Failed to update comment', 'error')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId).unwrap()
      showNotification('Comment deleted successfully!')
    } catch (error) {
      console.error('Error deleting comment:', error)
      showNotification('Failed to delete comment', 'error')
    }
  }

  if (lectureLoading) return <CircularProgress />

  const { title, description, youtubeLink } = data?.lecture || {}

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ alignSelf: 'flex-start', mb: 2 }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Main Content (Video and Description) */}
        <Box sx={{ flex: 3 }}>
          {/* Video Player */}
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 3,
              bgcolor: 'black',
              boxShadow: 3,
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src={youtubeLink
                ?.replace('watch?v=', 'embed/')
                ?.replace('youtu.be/', 'www.youtube.com/embed/')}
              title={title}
              frameBorder="0"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            ></iframe>
          </Box>

          {/* Title and Description */}
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Description</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {description}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Comments Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Comments
            </Typography>

            {/* Comment Input */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                disabled={isCreating}
              />
              <IconButton
                color="primary"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isCreating}
              >
                {isCreating ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>

            {/* Comments List */}
            {commentsLoading ? (
              <CircularProgress />
            ) : (
              <List>
                {commentsData?.comments?.map((comment) => (
                  <ListItem key={comment._id}>
                    <ListItemAvatar>
                      <Avatar>
                        {comment.userId?.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>

                    {editingCommentId === comment._id ? (
                      <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          disabled={isUpdating}
                        />
                        <IconButton
                          onClick={() => handleUpdateComment(comment._id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <CircularProgress size={24} />
                          ) : (
                            <CheckIcon />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setEditingCommentId(null)
                            setEditedText('')
                          }}
                          disabled={isUpdating}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        {console.log(comment)}
                        <ListItemText
                          primary={comment.text}
                          secondary={`by ${comment.userId?.name || 'Unknown'} • ${new Date(comment.createdAt).toLocaleDateString()}`}
                        />
                        {userInfo?._id == comment?.userId?._id && (
                          <ListItemSecondaryAction>
                            <IconButton
                              onClick={() => {
                                setEditingCommentId(comment._id)
                                setEditedText(comment.text)
                              }}
                              disabled={isDeleting}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteComment(comment._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <CircularProgress size={24} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Sidebar (AI Chatbot and Related Lectures) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* AI Chatbot */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              AI Chatbot
            </Typography>
            <Box
              sx={{
                height: '400px',
                overflowY: 'auto',
                mb: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Chatbot messages will appear here.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a question..."
              />
              <IconButton color="primary">
                <ChatBubbleOutlineIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Related Lectures */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Related Lectures
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {lecturesData?.lectures
                ?.filter((lecture) => lecture._id !== id)
                .map((lecture) => (
                  <Card
                    key={lecture._id}
                    sx={{ display: 'flex', cursor: 'pointer' }}
                    onClick={() => navigate(`/lecture/${lecture._id}`)}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 60, objectFit: 'cover' }}
                      image={`https://img.youtube.com/vi/${
                        lecture.youtubeLink.match(
                          /(?:v=|\/)([a-zA-Z0-9_-]{11})/
                        )?.[1] || ''
                      }/0.jpg`}
                      alt={lecture.title}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {lecture.title}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LecturePage
