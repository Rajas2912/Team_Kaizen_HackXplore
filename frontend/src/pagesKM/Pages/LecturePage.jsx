import React, { useState, useEffect } from 'react'
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
  CircularProgress,
  Snackbar,
  Alert,
  ListItemSecondaryAction,
  Fade,
  Grow,
  Slide,
  Zoom,
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
import axios from 'axios'
import { PYTHON_URL } from '../../redux/constants'

const API =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzM5OTA0MzAxIiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6IjM1YjM4MzY0MGJjOTRlYTk5NTVlN2ZhMDRkOTdiMmRmIn0.vb_sF-BrjLTiatDun5DjvWAssBleVeMAqTNQNc6E9iw'

const LecturePage = () => {
  const { id } = useParams()
  const { userInfo } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [expandedTranscript, setExpandedTranscript] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [chats, setChats] = useState([])
  const [message, setMessage] = useState('')

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

  const { title, description, youtubeLink } = data?.lecture || {}

  useEffect(() => {
    const fetchTranscript = async () => {
      if (youtubeLink) {
        try {
          const url = `https://api.supadata.ai/v1/youtube/transcript?url=${youtubeLink}&text=true`
          const response = await axios.get(url, {
            headers: {
              'x-api-key': API,
            },
          })
          if (response && response?.data?.content) {
            setTranscript(response.data.content)
            console.log(response)
            // Fetch summary using the optimized prompt
            const prompt = `Summarize the following video lecture transcript in 150 words or less, focusing on key points and main ideas: ${response.data.content}`
            const url2 = `${PYTHON_URL}/ask_gemini?prompt=${encodeURIComponent(
              prompt
            )}&api_key=AIzaSyA9MjZo6sIOlCQPQo5ojKBdHnGmUjlcsGc`

            const response2 = await axios.get(url2)
            console.log(response2)
            setSummary(response2.data.response)
          }
        } catch (error) {
          console.error('Error fetching transcript or summary:', error)
          showNotification('Failed to fetch transcript or summary', 'error')
        }
      }
    }

    fetchTranscript()
  }, [youtubeLink])

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      try {
        await createComment({
          lectureId: id,
          text: commentText,
          userId: userInfo._id,
        }).unwrap()
        setCommentText('')
        showNotification('Comment added successfully!')
      } catch (error) {
        console.error('Error creating comment:', error)
        showNotification('Failed to add comment', 'error')
      }
    }
  }

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const prompt = `You are an AI assistant helping a student understand a lecture. The lecture transcript is: ${transcript}. The student has asked: "${message}". Provide a detailed and accurate response based on the transcript. If the question is unrelated to the lecture, politely guide the student to ask relevant questions.`
        const url = `${PYTHON_URL}/ask_gemini?prompt=${encodeURIComponent(
          prompt
        )}&api_key=AIzaSyAa1cT3_l3mcJto_JE8Y673UXv1F5eq0w0`
        const response = await axios.get(url)
        setChats([
          ...chats,
          { question: message, reply: response.data.response },
        ])
        setMessage('')
      } catch (error) {
        console.error('Error sending message:', error)
        showNotification('Failed to send message', 'error')
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

  if (lectureLoading) return (
    <div className="flex items-center justify-center h-screen">
      <CircularProgress className="text-indigo-600" />
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          className="shadow-lg"
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Back Button */}
      <Zoom in={true}>
        <IconButton
          onClick={() => navigate(-1)}
          className="bg-white shadow-md hover:bg-gray-100 mb-4 transition-all duration-300 hover:scale-105"
        >
          <ArrowBackIcon className="text-indigo-600" />
        </IconButton>
      </Zoom>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Main Content (Video and Description) */}
        <div className="flex-1">
          {/* Video Player - Reduced size */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-2 transition-all duration-300 hover:shadow-xl max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="100%"
              src={youtubeLink
                ?.replace('watch?v=', 'embed/')
                ?.replace('youtu.be/', 'www.youtube.com/embed/')}
              title={title}
              frameBorder="0"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Title and Description */}
          <Typography variant="h4" className="font-bold text-gray-800 mb-3">
            {title}
          </Typography>

          <Fade in={true}>
            <Accordion
              expanded={expandedDescription}
              onChange={() => setExpandedDescription(!expandedDescription)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon className="text-indigo-500" />}>
                <Typography className="font-medium text-gray-700">Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography className="text-gray-600 whitespace-pre-line">
                  {description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Fade>

          {/* Comments Section */}
          <div className="mt-6">
            <Typography variant="h6" className="font-bold text-gray-800 mb-3">
              Discussion
            </Typography>

            {/* Comment Input */}
            <Grow in={true}>
              <div className="flex gap-2 mb-4">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  disabled={isCreating}
                  className="bg-white rounded-lg"
                  InputProps={{
                    className: "rounded-lg"
                  }}
                />
                <IconButton
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || isCreating}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300"
                >
                  {isCreating ? <CircularProgress size={24} className="text-white" /> : <SendIcon />}
                </IconButton>
              </div>
            </Grow>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center">
                <CircularProgress className="text-indigo-600" />
              </div>
            ) : (
              <List className="space-y-2">
                {commentsData?.comments?.map((comment, index) => (
                  <Slide key={comment._id} direction="up" in={true} timeout={index * 100}>
                    <ListItem className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow duration-300">
                      <ListItemAvatar>
                        <Avatar className="bg-indigo-100 text-indigo-600">
                          {comment.userId?.username?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                      </ListItemAvatar>

                      {editingCommentId === comment._id ? (
                        <div className="flex-grow flex gap-2">
                          <TextField
                            fullWidth
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            disabled={isUpdating}
                            className="bg-gray-50 rounded-lg"
                          />
                          <IconButton
                            onClick={() => handleUpdateComment(comment._id)}
                            disabled={isUpdating}
                            className="bg-green-100 text-green-600 hover:bg-green-200"
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
                            className="bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <CloseIcon />
                          </IconButton>
                        </div>
                      ) : (
                        <>
                          <ListItemText
                            primary={comment.text}
                            primaryTypographyProps={{ className: "text-gray-800" }}
                            secondary={`by ${comment.userId?.name || 'Unknown'} • ${new Date(comment.createdAt).toLocaleDateString()}`}
                            secondaryTypographyProps={{ className: "text-gray-500 text-sm" }}
                          />
                          {userInfo?._id == comment?.userId?._id && (
                            <ListItemSecondaryAction className="flex gap-1">
                              <IconButton
                                onClick={() => {
                                  setEditingCommentId(comment._id)
                                  setEditedText(comment.text)
                                }}
                                disabled={isDeleting}
                                className="text-indigo-600 hover:bg-indigo-50"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:bg-red-50"
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
                  </Slide>
                ))}
              </List>
            )}
          </div>
        </div>

        {/* Sidebar (AI Chatbot, Summary, and Related Lectures) */}
        <div className="w-full lg:w-80 space-y-4">
          {/* AI Chatbot */}
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-3 text-white">
                <Typography variant="h6" className="font-bold">
                  AI Lecture Assistant
                </Typography>
              </div>
              <div className="h-80 overflow-y-auto p-3 bg-gray-50">
                {chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ChatBubbleOutlineIcon className="text-gray-300 text-4xl mb-2" />
                    <Typography variant="body2" className="text-gray-500">
                      Ask questions about the lecture to get started
                    </Typography>
                  </div>
                ) : (
                  chats.map((chat, index) => (
                    <div key={index} className="mb-3">
                      {/* User Message */}
                      <div className="flex justify-end mb-1">
                        <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl rounded-br-none max-w-xs">
                          <Typography variant="body2">{chat.question}</Typography>
                        </div>
                      </div>
                      {/* AI Reply */}
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl rounded-bl-none max-w-xs shadow-sm">
                          <Typography variant="body2">{chat.reply}</Typography>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={message}
                    name="message"
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about the lecture..."
                    className="bg-white rounded-lg"
                    InputProps={{
                      className: "rounded-lg"
                    }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Section */}
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <CardContent>
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 -m-3 mb-3 rounded-t-lg text-white">
                <Typography variant="h6" className="font-bold">
                  Key Takeaways
                </Typography>
              </div>
              <Typography variant="body1" className="text-gray-600 whitespace-pre-line text-sm">
                {summary || (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <CircularProgress size={16} className="text-blue-500" />
                    <span>Generating summary...</span>
                  </div>
                )}
              </Typography>
            </CardContent>
          </Card>

          {/* Related Lectures */}
          <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent>
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-3 -m-3 mb-3 rounded-t-lg text-white">
                <Typography variant="h6" className="font-bold">
                  Related Lectures
                </Typography>
              </div>
              <div className="space-y-2">
                {lecturesData?.lectures
                  ?.filter((lecture) => lecture._id !== id)
                  .map((lecture) => (
                    <Card
                      key={lecture._id}
                      className="flex cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => navigate(`/lecture/${lecture._id}`)}
                    >
                      <CardMedia
                        component="img"
                        className="w-20 h-14 object-cover"
                        image={`https://img.youtube.com/vi/${
                          lecture.youtubeLink.match(
                            /(?:v=|\/)([a-zA-Z0-9_-]{11})/
                          )?.[1] || ''
                        }/0.jpg`}
                        alt={lecture.title}
                      />
                      <CardContent className="flex-1 p-2">
                        <Typography
                          variant="subtitle2"
                          className="font-semibold text-gray-800 line-clamp-2 text-sm"
                        >
                          {lecture.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LecturePage