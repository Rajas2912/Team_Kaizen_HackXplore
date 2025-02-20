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
  LinearProgress,
  useTheme,
  Avatar,
  TextField,
  Collapse,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UploadIcon from '@mui/icons-material/Upload'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import { motion } from 'framer-motion'
import { styled } from '@mui/system'
import {
  useDeleteAssignmentMutation,
  useGetAssignmentsByClassQuery,
  useUpdateAssignmentMutation,
  useUploadAssignmentMutation,
  useSubmitAnswerMutation,
} from '../../redux/api/assignmentSlice'
import { BASE_URL } from '../../redux/constants'
import { useSelector } from 'react-redux'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

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

const AssignmentPage = ({ classId }) => {
  const { userInfo } = useSelector((state) => state.user)
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [chapterPdf, setChapterPdf] = useState(null)
  const [assignmentPdf, setAssignmentPdf] = useState(null)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null)
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const theme = useTheme()

  // RTK Query hooks
  const {
    data: assignments,
    isLoading,
    refetch,
  } = useGetAssignmentsByClassQuery(classId)
  const [uploadAssignment, { isLoading: isUploading }] =
    useUploadAssignmentMutation()
  const [deleteAssignment, { isLoading: isDeleting }] =
    useDeleteAssignmentMutation()
  const [updateAssignment, { isLoading: isUpdating }] =
    useUpdateAssignmentMutation()
  const [submitAnswer, { isLoading: isAnswering }] = useSubmitAnswerMutation()
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  const handleUpload = async (assignmentPdf) => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }
  
    const formData = new FormData();
    formData.append("userFile", selectedFile);
    formData.append("assignmentPdf", assignmentPdf);
  
    try {
      const response = await fetch("http://localhost:5000/upload_assignment", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const result = await response.json();
        alert("Upload Successful! Response: " + JSON.stringify(result));
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }

  // Handle file input change for chapter PDF
  const handleChapterPdfChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setChapterPdf(selectedFile)
      } else {
        setNotification({
          open: true,
          message:
            'Invalid file type. Please upload a PDF file for the chapter.',
          severity: 'error',
        })
      }
    }
  }

  // Handle file input change for assignment PDF
  const handleAssignmentPdfChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setAssignmentPdf(selectedFile)
      } else {
        setNotification({
          open: true,
          message:
            'Invalid file type. Please upload a PDF file for the assignment.',
          severity: 'error',
        })
      }
    }
  }

  // Handle assignment upload
  const handleUploadAssignment = async () => {
    if (!title || !deadline || !chapterPdf || !assignmentPdf) {
      setNotification({
        open: true,
        message: 'Please provide a title, deadline, and select both files.',
        severity: 'error',
      })
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('deadline', deadline)
    formData.append('classId', classId)
    formData.append('chapterPdf', chapterPdf)
    formData.append('assignmentPdf', assignmentPdf)

    try {
      await uploadAssignment(formData).unwrap()
      setNotification({
        open: true,
        message: 'Assignment uploaded successfully!',
        severity: 'success',
      })
      setOpenDialog(false)
      setTitle('')
      setDescription('')
      setDeadline('')
      setChapterPdf(null)
      setAssignmentPdf(null)
      refetch() // Refresh the assignments list
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || 'Failed to upload assignment.',
        severity: 'error',
      })
    }
  }

  // Handle assignment deletion
  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId).unwrap()
      setNotification({
        open: true,
        message: 'Assignment deleted successfully!',
        severity: 'success',
      })
      refetch() // Refresh the assignments list
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || 'Failed to delete assignment.',
        severity: 'error',
      })
    }
  }

  // Handle assignment edit
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment)
    setTitle(assignment.title)
    setDescription(assignment.description)
    setDeadline(new Date(assignment.deadline).toISOString().split('T')[0])
    setOpenEditDialog(true)
  }

  // Handle assignment update
  const handleUpdateAssignment = async () => {
    if (!title || !deadline) {
      setNotification({
        open: true,
        message: 'Please provide a title and deadline.',
        severity: 'error',
      })
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('deadline', deadline)
    if (chapterPdf) formData.append('chapterPdf', chapterPdf)
    if (assignmentPdf) formData.append('assignmentPdf', assignmentPdf)

    try {
      await updateAssignment({
        assignmentId: editingAssignment._id,
        formData,
      }).unwrap()
      setNotification({
        open: true,
        message: 'Assignment updated successfully!',
        severity: 'success',
      })
      setOpenEditDialog(false)
      setTitle('')
      setDescription('')
      setDeadline('')
      setChapterPdf(null)
      setAssignmentPdf(null)
      refetch() // Refresh the assignments list
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || 'Failed to update assignment.',
        severity: 'error',
      })
    }
  }

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Toggle expanded state for assignment card
  const toggleExpand = (assignmentId) => {
    setExpandedAssignmentId((prevId) =>
      prevId === assignmentId ? null : assignmentId
    )
  }

  return (
    <Box sx={{ p: 3, background: theme.palette.background.default }}>
      {/* Page Header */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
      >
        Assignments
      </Typography>

      {/* Create Assignment Button */}
      {userInfo.role == 'teacher' && (
        <StyledButton
          startIcon={<UploadIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 3 }}
        >
          Create New Assignment
        </StyledButton>
      )}

      {/* Assignments List */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box>
          {assignments?.map((assignment) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StyledCard>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleExpand(assignment._id)}
                  >
                    {/* Left Side: Assignment Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <DescriptionIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {assignment?.title.length > 50
                            ? `${assignment?.title.slice(0, 50)}...`
                            : assignment?.title}
                        </Typography>

                        <Typography variant="body2" color="textSecondary">
                          Uploaded on:{' '}
                          {new Date(assignment?.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Deadline:{' '}
                          {new Date(assignment?.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right Side: Actions and PDF Links */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Assignment PDF Link */}
                      <Button
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        component="a"
                        href={`${BASE_URL}/uploads/${assignment.assignmentPdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Assignment PDF
                      </Button>

                      {/* Chapter PDF Link */}
                      {userInfo.role === 'teacher' && (
                        <Button
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                          component="a"
                          href={`${BASE_URL}/uploads/${assignment.chapterPdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Chapter PDF
                        </Button>
                      )}
                      {userInfo.role === 'student' && (
                        <Button
                          component="label"
                          role={undefined}
                          variant="contained"
                          tabIndex={-1}
                          startIcon={<CloudUploadIcon />}
                        >
                          Upload assignment
                          <VisuallyHiddenInput
                            type="file"
                            onChange={handleFileChange}
                          />
                        </Button>

                      )}
                      {/* Delete Button */}
                      {userInfo.role == 'teacher' && (
                        <>
                          <IconButton
                            edge="end"
                            onClick={() =>
                              confirm(
                                'Are you sure you want to delete this assignment?'
                              ) && handleDeleteAssignment(assignment._id)
                            }
                            disabled={isDeleting}
                            sx={{ color: theme.palette.error.main }}
                          >
                            {isDeleting ? (
                              <CircularProgress size={24} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>

                          {/* Edit Button */}
                          <IconButton
                            edge="end"
                            onClick={() => handleEditAssignment(assignment)}
                            disabled={isUpdating}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            {isUpdating ? (
                              <CircularProgress size={24} />
                            ) : (
                              <EditIcon />
                            )}
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Description Section */}
                  <Collapse in={expandedAssignmentId === assignment._id}>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                      Title:
                    </Typography>
                    <Typography variant="body1">{assignment?.title}</Typography>

                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                      Description:
                    </Typography>
                    <Typography variant="body1">
                      {assignment?.description}
                    </Typography>
                  </Collapse>

                  {/* Progress Bar for Uploading */}
                  {isUploading && <LinearProgress sx={{ mt: 2 }} />}
                </CardContent>
              </StyledCard>
            </motion.div>
          ))}
        </Box>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              marginTop: '10px',
            }}
          >
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />
            <TextField
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Chapter PDF
              <input
                type="file"
                hidden
                onChange={handleChapterPdfChange}
                accept="application/pdf"
                required
              />
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Assignment PDF
              <input
                type="file"
                hidden
                onChange={handleAssignmentPdfChange}
                accept="application/pdf"
                required
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadAssignment}
            disabled={isUploading}
            variant="contained"
            color="primary"
          >
            {isUploading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
      >
        <DialogTitle>Edit Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload New Chapter PDF
              <input
                type="file"
                hidden
                onChange={handleChapterPdfChange}
                accept="application/pdf"
              />
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload New Assignment PDF
              <input
                type="file"
                hidden
                onChange={handleAssignmentPdfChange}
                accept="application/pdf"
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateAssignment}
            disabled={isUpdating}
            variant="contained"
            color="primary"
          >
            {isUpdating ? <CircularProgress size={24} /> : 'Update'}
          </Button>
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

export default AssignmentPage
