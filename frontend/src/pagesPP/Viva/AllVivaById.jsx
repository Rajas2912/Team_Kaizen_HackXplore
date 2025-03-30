import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Typography,
  Modal,
  Select,
  MenuItem,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  useTheme,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  PlayArrow as StartIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import CreateViva from './CreateViva'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import { jsPDF } from 'jspdf' // For PDF generation
import 'jspdf-autotable' // For table support in PDF

const API = import.meta.env.VITE_BACKEND_URL

const AllVivaById = ({ classId }) => {
  const theme = useTheme();
  const [vivas, setVivas] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [students, setStudents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const role = userInfo?.role;
  // useEffect(() => {
  //   if (userInfo?.role) {
  //     setRole(userInfo.role)
  //     // console.log("Role updated:", userInfo.role);
  //   }
  // }, [userInfo?.role])
  useEffect(() => {
    const fetchAllVivas = async () => {
      try {
        const response = await axios.get(`${API}/viva/getallViva/${classId}`)
        setVivas(response.data)
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching vivas:', error)
      }
    }
    fetchAllVivas()
  }, [classId])

  const fetchRegisteredStudents = async (vivaId) => {
    try {
      const response = await axios.get(
        `${API}/vivaresult/getvivaresult/${vivaId}`
      )
      console.log(response?.data?.data)
      setStudents((prev) => ({ ...prev, [vivaId]: response?.data }))
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleRowClick = (index, vivaId) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }))
    if (!students[vivaId]) fetchRegisteredStudents(vivaId)
    console.log(vivaId)
  }

  const handleStatusChange = async (vivaId, newStatus) => {
    try {
      await axios.put(`${API}/viva/updateViva/${vivaId}`, {
        status: newStatus,
      })
      setVivas((prev) =>
        prev.map((viva) =>
          viva._id === vivaId ? { ...viva, status: newStatus } : viva
        )
      )
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleEdit = (viva) => {
    setEditMode(viva._id)
    setEditedData({ ...viva })
  }

  const handleSave = async (vivaId) => {
    try {
      await axios.put(`${API}/viva/updateViva/${vivaId}`, editedData)
      setVivas((prev) =>
        prev.map((viva) => (viva._id === vivaId ? { ...editedData } : viva))
      )
      setEditMode(null)
    } catch (error) {
      console.error('Error updating viva:', error)
    }
  }

  const handleCancel = () => {
    setEditMode(null)
  }
  const handleStartViva = (vivaId) => {
    navigate(`/takepicture/${vivaId}`)
  }

  const StudentDetailsModal = ({ student, open, onClose }) => {
    if (!student) return null
    // Function to download PDF
    const downloadPDF = () => {
      const doc = new jsPDF()

      // Add student details
      doc.setFontSize(16)
      doc.text('Student Details', 10, 10)
      doc.setFontSize(12)
      doc.text(`Name: ${student.studentName}`, 10, 20)
      doc.text(`Viva ID: ${student.vivaId}`, 10, 30)
      doc.text(
        `Date of Viva: ${new Date(student.dateOfViva).toLocaleString()}`,
        10,
        40
      )
      doc.text(`Total Questions: ${student.totalQuestions}`, 10, 50)
      doc.text(
        `Questions Attempted: ${student.questionAnswerSet.length}`,
        10,
        60
      )
      doc.text(`Overall Mark: ${student.overallMark}`, 10, 70)

      // Add proctored feedback
      doc.setFontSize(16)
      doc.text('Proctored Feedback', 10, 90)
      doc.setFontSize(12)
      doc.text(
        `Book Detected Count: ${student?.proctoredFeedback?.bookDetectedCount}`,
        10,
        100
      )
      doc.text(
        `Laptop Detected Count: ${student?.proctoredFeedback?.laptopDetectedCount}`,
        10,
        110
      )
      doc.text(
        `Multiple Users Detected Count: ${student?.proctoredFeedback?.multipleUsersDetectedCount}`,
        10,
        120
      )
      doc.text(
        `Phone Detected Count: ${student?.proctoredFeedback?.phoneDetectedCount}`,
        10,
        130
      )
      doc.text(
        `Tab Switching Detected Count: ${student?.proctoredFeedback?.tabSwitchingDetectedCount}`,
        10,
        140
      )

      // Add question details table
      doc.setFontSize(16)
      doc.text('Question Details', 10, 160)

      const tableData = student.questionAnswerSet.map((question) => [
        question.questionText,
        question.modelAnswer,
        question.studentAnswer,
        `Relevance: ${question.evaluation?.Relevance || 0}/10\nCompleteness: ${question.evaluation?.Completeness || 0}/10\nAccuracy: ${question.evaluation?.Accuracy || 0}/10\nDepth of Knowledge: ${question.evaluation?.DepthOfKnowledge || 0}/10`,
      ])

      doc.autoTable({
        startY: 170,
        head: [['Question', 'Model Answer', 'Student Answer', 'Evaluation']],
        body: tableData,
      })

      // Save the PDF
      doc.save(`student_report_${student.studentName}.pdf`)
    }

    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          {/* Student Details Section */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Student Details
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {student.studentName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Viva ID:</strong> {student.vivaId}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Date of Viva:</strong>{' '}
            {new Date(student.dateOfViva).toLocaleString()}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Total Questions:</strong> {student.totalQuestions}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Questions Attempted:</strong>{' '}
            {student.questionAnswerSet.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Overall Mark:</strong> {student.overallMark}
          </Typography>

          {/* Proctored Feedback Section */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mt: 3, fontWeight: 'bold' }}
          >
            Proctored Feedback
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Book Detected Count:</strong>{' '}
              {student?.proctoredFeedback?.bookDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Laptop Detected Count:</strong>{' '}
              {student?.proctoredFeedback?.laptopDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Multiple Users Detected Count:</strong>{' '}
              {student?.proctoredFeedback?.multipleUsersDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Phone Detected Count:</strong>{' '}
              {student?.proctoredFeedback?.phoneDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Tab Switching Detected Count:</strong>{' '}
              {student?.proctoredFeedback?.tabSwitchingDetectedCount}
            </Typography>
          </Box>

      {/* Question Details Table */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Question Details
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Question</strong>
              </TableCell>
              <TableCell>
                <strong>Model Answer</strong>
              </TableCell>
              <TableCell>
                <strong>Student Answer</strong>
              </TableCell>
              <TableCell>
                <strong>Evaluation</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {student.questionAnswerSet.map((question, index) => (
              <TableRow key={question._id}>
                <TableCell>{question.questionText}</TableCell>
                <TableCell>{question.modelAnswer}</TableCell>
                <TableCell>{question.studentAnswer}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Relevance:</strong> {console.log(question?.evaluation)}{question.evaluation }
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

          {/* Buttons Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={downloadPDF}>
              Download PDF
            </Button>
            <Button variant="contained" color="secondary" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    )
  }
  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'error';
  };
  return (
    <Box sx={{ p: 3, maxWidth: '1800px', mx: 'auto' }}>
    {/* Header Section */}
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 4,
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 'bold',
        color: 'black',
        fontFamily: 'Montserrat-Regular'
      }}>
        Viva Examinations
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
        
        {role === 'teacher' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              backgroundColor: '#C89365',
              '&:hover': {
                backgroundColor: '#c9bbae'
              }
            }}
          >
            Create Viva
          </Button>
        )}
      </Box>
    </Box>

    {/* Viva Cards/Table */}
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                {role !== 'student' && <TableCell width="50px" />}
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Viva Name</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Questions</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Thinking Time</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Due Date</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Status</Typography></TableCell>
                <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vivas
                .filter((viva) => statusFilter === 'all' || viva.status === statusFilter)
                .map((viva, index) => (
                  <React.Fragment key={viva._id}>
                    <TableRow hover>
                      {role !== 'student' && (
                        <TableCell>
                          <IconButton
                            onClick={() => handleRowClick(index, viva._id)}
                            size="small"
                          >
                            {openRows[index] ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                      )}

                      <TableCell>
                        {editMode === viva._id ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={editedData.vivaname}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                vivaname: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <Typography fontWeight="medium">{viva.vivaname}</Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Chip 
                          label={viva.questionAnswerSet.length} 
                          style={{backgroundColor:'#C89365',color:'white'}}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center">
                        {editMode === viva._id ? (
                          <TextField
                            size="small"
                            type="number"
                            sx={{ width: 80 }}
                            value={editedData.timeofthinking}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                timeofthinking: e.target.value,
                              })
                            }
                          />
                        ) : (
                          `${viva.timeofthinking} min`
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {editMode === viva._id ? (
                          <TextField
                            size="small"
                            type="date"
                            value={editedData.updatedAt.split('T')[0]}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                updatedAt: e.target.value,
                              })
                            }
                          />
                        ) : (
                          new Date(viva.updatedAt).toLocaleDateString()
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={viva.status === 'Active' ? 'Active' : 'Inactive'}
                          color={getStatusColor(viva.status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center">
                        {role === 'student' ? (
                          <Button
                            variant="contained"
                            startIcon={<StartIcon />}
                            onClick={() => handleStartViva(viva._id)}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.success.main,
                              '&:hover': {
                                backgroundColor: theme.palette.success.dark
                              }
                            }}
                          >
                            Start
                          </Button>
                        ) : editMode === viva._id ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Save">
                              <IconButton 
                                onClick={() => handleSave(viva._id)}
                                color="primary"
                              >
                                <SaveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton 
                                onClick={handleCancel}
                                color="error"
                              >
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleEdit(viva)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Student Details */}
                    {role !== 'student' && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0 }}>
                          <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
                              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                Registered Students: {students[viva._id]?.data?.length || 0}
                              </Typography>

                              {students[viva._id]?.data?.length > 0 ? (
                                <TableContainer component={Paper} elevation={0}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Student</TableCell>
                                        <TableCell align="center">Questions</TableCell>
                                        <TableCell align="center">Attempted</TableCell>
                                        <TableCell align="center">Date/Time</TableCell>
                                        <TableCell align="center">Score</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {students[viva._id].data.map((student) => (
                                        <TableRow key={student._id} hover>
                                          <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Avatar sx={{ width: 32, height: 32 }}>
                                                <PersonIcon fontSize="small" />
                                              </Avatar>
                                              <Typography style={{fontFamily:'Montserrat-Regular'}} >{student.studentName}</Typography>
                                            </Box>
                                          </TableCell>
                                          <TableCell align="center">{student.totalQuestions}</TableCell>
                                          <TableCell align="center">{student.questionAnswerSet.length}</TableCell>
                                          <TableCell align="center">
                                            {new Date(student.dateOfViva).toLocaleString()}
                                          </TableCell>
                                          <TableCell align="center">
                                            <Chip 
                                              label={student.overallMark} 
                                              style={{backgroundColor:'#C89365',color:'white'}}
                                              size="small"
                                            />
                                          </TableCell>
                                          <TableCell align="center">
                                            <Button
                                              variant="outlined"
                                              startIcon={<DescriptionIcon />}
                                              onClick={() => {
                                                setSelectedStudent(student);
                                                setIsStudentModalOpen(true);
                                              }}
                                              size="small"
                                              
                                              style={{color:'#C89365',borderColor:'#C89365',fontFamily:'Montserrat-Regular'}}
                                            >
                                              Details
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No students have taken this viva yet.
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>

    {/* Empty State */}
    {vivas.length === 0 && (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No vivas found for this class
        </Typography>
        {role === 'teacher' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Viva
          </Button>
        )}
      </Box>
    )}

    {/* Modals */}
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <Box sx={modalStyle}>
        <CreateViva onClose={() => setIsModalOpen(false)} classId={classId} />
      </Box>
    </Modal>

    <StudentDetailsModal
      student={selectedStudent}
      open={isStudentModalOpen}
      onClose={() => setIsStudentModalOpen(false)}
    />
  </Box>
);
};

const modalStyle = {
position: 'absolute',
top: '50%',
left: '50%',
transform: 'translate(-50%, -50%)',
width: '80%',
maxWidth: '1000px',
bgcolor: 'background.paper',
boxShadow: 24,
p: 4,
borderRadius: 2,
maxHeight: '90vh',
overflowY: 'auto',
};

export default AllVivaById;