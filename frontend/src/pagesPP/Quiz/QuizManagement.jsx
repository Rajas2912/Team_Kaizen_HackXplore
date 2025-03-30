import React, { useEffect, useState } from "react";
import axios from "axios";
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
  TextField,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
  useTheme,
} from "@mui/material";
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
  Event as EventIcon,
  Quiz as QuizIcon
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs"; // Import dayjs
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreateQuiz from "./CreateQuiz";
import { jsPDF } from "jspdf";

const API = import.meta.env.VITE_BACKEND_URL;















const QuizManagement = ({ classId }) => {
  const theme = useTheme();
  const [quizzes, setQuizzes] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [students, setStudents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (userInfo?.role) {
  //     setRole(userInfo.role);
  //   }
  // }, [userInfo?.role]);

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/quiz/getquizbyid/${classId}`);
        setQuizzes(response.data);
      } catch (error) {
        setError("Failed to fetch quizzes");
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllQuizzes();
  }, [classId]);

  const fetchRegisteredStudents = async (quizId) => {
    try {
      const response = await axios.get(`${API}/quizresult/quizresultbyquizid/${quizId}`);
      setStudents((prev) => ({ ...prev, [quizId]: response?.data }));
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleRowClick = (index, quizId) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!students[quizId]) fetchRegisteredStudents(quizId);
  };

  const handleEdit = (quiz) => {
    setEditMode(quiz._id);
    setEditedData({ ...quiz, duedate: dayjs(quiz.duedate), startTime: dayjs(quiz.startTime) });
  };

  const handleSave = async (quizId) => {
    try {
      const dataToSave = {
        ...editedData,
        duedate: editedData.duedate.toISOString(),
        startTime: editedData.startTime.toISOString(),
      };
      await axios.put(`${API}/quiz/updateQuiz/${quizId}`, dataToSave);
      setQuizzes((prev) =>
        prev.map((quiz) => (quiz._id === quizId ? { ...dataToSave } : quiz))
      );
      setEditMode(null);
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  const handleCancel = () => {
    setEditMode(null);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/givepicture/${quizId}`);
  };

  const handleQuestionModalOpen = (quiz) => {
    setSelectedQuiz(quiz);
    setIsQuestionModalOpen(true);
  };

  const handleQuestionModalClose = () => {
    setIsQuestionModalOpen(false);
  };


  const StudentDetailsModal = ({ student, open, onClose }) => {
    if (!student) return null;
  
    const handleDownloadPDF = () => {
      const doc = new jsPDF();
  
      // Add student details to the PDF
      doc.text(`Student Name: ${student.studentName}`, 10, 10);
      doc.text(`Quiz ID: ${student.quizId}`, 10, 20);
      doc.text(`Date and Time: ${new Date(student.dateofquiz).toLocaleString()}`, 10, 30);
      doc.text(`Total Questions: ${student.totalQuestions}`, 10, 40);
      doc.text(`Questions Attempted: ${student.questionAnswerSet.length}`, 10, 50);
      doc.text(`Total Score: ${student.overallMark}`, 10, 60);
  
      // Add proctored feedback to the PDF
      doc.text("Proctored Feedback:", 10, 70);
      doc.text(`Book Detected Count: ${student?.proctoredFeedback?.bookDetectedCount}`, 10, 80);
      doc.text(`Laptop Detected Count: ${student?.proctoredFeedback?.laptopDetectedCount}`, 10, 90);
      doc.text(`Multiple Users Detected Count: ${student?.proctoredFeedback?.multipleUsersDetectedCount}`, 10, 100);
      doc.text(`Phone Detected Count: ${student?.proctoredFeedback?.phoneDetectedCount}`, 10, 110);
      doc.text(`Tab Switching Detected Count: ${student?.proctoredFeedback?.tabSwitchingDetectedCount}`, 10, 120);
  
      // Add question details to the PDF
      doc.text("Question Details:", 10, 130);
      let yOffset = 140;
      student.questionAnswerSet.forEach((question, index) => {
        doc.text(`Question ${index + 1}: ${question.questionText}`, 10, yOffset);
        doc.text(`Model Answer: ${question.correctoption}`, 10, yOffset + 10);
        doc.text(`Student Answer: ${question.studentAnswer}`, 10, yOffset + 20);
        doc.text(`Evaluation: ${question.studentAnswer === question.correctoption ? "Correct" : "Incorrect"}`, 10, yOffset + 30);
        yOffset += 40;
      });
  
      // Save the PDF
      doc.save(`student_feedback_${student.studentName}.pdf`);
    };
  
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Student Details
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {student.studentName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Quiz ID:</strong> {student.quizId}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Date and Time:</strong>{" "}
            {new Date(student.dateofquiz).toLocaleString()}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Total Questions:</strong> {student.totalQuestions}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Questions Attempted:</strong>{" "}
            {student.questionAnswerSet.length}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Total Score:</strong> {student.overallMark}
          </Typography>
  
          {/* Proctored Feedback Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
            Proctored Feedback
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Book Detected Count:</strong>{" "}
              {student?.proctoredFeedback?.bookDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Laptop Detected Count:</strong>{" "}
              {student?.proctoredFeedback?.laptopDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Multiple Users Detected Count:</strong>{" "}
              {student?.proctoredFeedback?.multipleUsersDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Phone Detected Count:</strong>{" "}
              {student?.proctoredFeedback?.phoneDetectedCount}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Tab Switching Detected Count:</strong>{" "}
              {student?.proctoredFeedback?.tabSwitchingDetectedCount}
            </Typography>
          </Box>
  
          {/* Question Details Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
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
                    <TableCell>{question?.questionText}</TableCell>
                    <TableCell>{question?.correctoption}</TableCell>
                    <TableCell>{question?.studentAnswer}</TableCell>
                    <TableCell>{question?.studentAnswer === question?.correctoption ? "True" : "False"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
  
          {/* Download PDF Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="contained" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

  const QuestionDetailsModal = ({ quiz, open, onClose }) => {
    if (!quiz) return null;

    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Question Details
          </Typography>
          {quiz.questionAnswerSet.map((question, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question {index + 1}
              </Typography>
              <TextField
                fullWidth
                label="Question Text"
                value={question.questionText}
                onChange={(e) => {
                  const updatedQuestions = [...quiz.questionAnswerSet];
                  updatedQuestions[index].questionText = e.target.value;
                  setSelectedQuiz({ ...quiz, questionAnswerSet: updatedQuestions });
                }}
                sx={{ mb: 2 }}
              />
              {question.options.map((option, oIndex) => (
                <Box key={oIndex} display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Option ${oIndex + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updatedQuestions = [...quiz.questionAnswerSet];
                      updatedQuestions[index].options[oIndex] = e.target.value;
                      setSelectedQuiz({ ...quiz, questionAnswerSet: updatedQuestions });
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Radio
                        checked={question.correctoption === option}
                        onChange={() => {
                          const updatedQuestions = [...quiz.questionAnswerSet];
                          updatedQuestions[index].correctoption = option;
                          setSelectedQuiz({ ...quiz, questionAnswerSet: updatedQuestions });
                        }}
                      />
                    }
                    label="Correct"
                  />
                </Box>
              ))}
            </Box>
          ))}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    );
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
          fontFamily:'Montserrat-Regular',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <QuizIcon fontSize="large" />
          Quiz Management
        </Typography>
        
        {userInfo?.role === "teacher" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              backgroundColor: '#58545B',
              '&:hover': {
                backgroundColor: '#B7A7AE'
              }
            }}
          >
            Create Quiz
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    {userInfo?.role !== "student" && <TableCell width="50px" />}
                    <TableCell><Typography variant="subtitle1" fontWeight="bold">Quiz Name</Typography></TableCell>
                    <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Questions</Typography></TableCell>
                    <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Due Date</Typography></TableCell>
                    <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Start Time</Typography></TableCell>
                    <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Duration</Typography></TableCell>
                    <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizzes.map((quiz, index) => (
                    <React.Fragment key={quiz._id}>
                      <TableRow hover>
                        {userInfo?.role !== "student" && (
                          <TableCell>
                            <IconButton
                              onClick={() => handleRowClick(index, quiz._id)}
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
                          {editMode === quiz._id ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={editedData.quizname}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  quizname: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <Typography fontWeight="medium">{quiz.quizname}</Typography>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {userInfo?.role === "teacher" ? (
                            <Button 
                              onClick={() => handleQuestionModalOpen(quiz)}
                              variant="outlined"
                              size="small"
                            >
                              {quiz.questionAnswerSet.length}
                            </Button>
                          ) : (
                            <Chip 
                              label={quiz.questionAnswerSet.length} 
                              color="primary" 
                              size="small"
                            />
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {editMode === quiz._id ? (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DateTimePicker
                                value={editedData.duedate}
                                onChange={(newValue) =>
                                  setEditedData({
                                    ...editedData,
                                    duedate: newValue,
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    sx={{ width: 180 }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          ) : (
                            dayjs(quiz.duedate).format('MMM D, YYYY h:mm A')
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {editMode === quiz._id ? (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DateTimePicker
                                value={editedData.startTime}
                                onChange={(newValue) =>
                                  setEditedData({
                                    ...editedData,
                                    startTime: newValue,
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    sx={{ width: 180 }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          ) : (
                            dayjs(quiz.startTime).format('MMM D, YYYY h:mm A')
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {editMode === quiz._id ? (
                            <TextField
                              size="small"
                              type="number"
                              sx={{ width: 80 }}
                              value={editedData.duration}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  duration: e.target.value,
                                })
                              }
                            />
                          ) : (
                            `${quiz.duration} min`
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {userInfo?.role === "student" ? (
                            <Button
                              variant="contained"
                              startIcon={<StartIcon />}
                              onClick={() => handleStartQuiz(quiz._id)}
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
                          ) : editMode === quiz._id ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Save">
                                <IconButton 
                                  onClick={() => handleSave(quiz._id)}
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
                                onClick={() => handleEdit(quiz)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Student Details */}
                      {userInfo?.role !== "student" && (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0 }}>
                            <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                  Student Submissions: {students[quiz._id]?.length || 0}
                                </Typography>

                                {students[quiz._id]?.length > 0 ? (
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
                                        {students[quiz._id].map((student) => (
                                          <TableRow key={student._id} hover>
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32 }}>
                                                  <PersonIcon fontSize="small" />
                                                </Avatar>
                                                <Typography>{student.studentName}</Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell align="center">{student.totalQuestions}</TableCell>
                                            <TableCell align="center">{student.questionAnswerSet.length}</TableCell>
                                            <TableCell align="center">
                                              {dayjs(student.dateofquiz).format('MMM D, YYYY h:mm A')}
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={student.overallMark} 
                                                color="primary" 
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
                                    No students have taken this quiz yet.
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
      )}

      {/* Empty State */}
      {quizzes.length === 0 && !loading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 4,
          textAlign: 'center'
        }}>
          <QuizIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No quizzes found for this class
          </Typography>
          {userInfo?.role === "teacher" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{ mt: 2 }}
            >
              Create Your First Quiz
            </Button>
          )}
        </Box>
      )}

      {/* Modals */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <CreateQuiz onClose={() => setIsModalOpen(false)} classId={classId} />
        </Box>
      </Modal>

      <StudentDetailsModal
        student={selectedStudent}
        open={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />

      <QuestionDetailsModal
        quiz={selectedQuiz}
        open={isQuestionModalOpen}
        onClose={handleQuestionModalClose}
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
  borderRadius: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default QuizManagement;