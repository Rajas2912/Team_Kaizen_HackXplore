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
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
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
  const [quizzes, setQuizzes] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [students, setStudents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [role, setRole] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const { userInfo } = useSelector((state) => state.user);
  console.log(userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo?.role) {
      setRole(userInfo.role);
    }
  }, [userInfo?.role]);

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        const response = await axios.get(`${API}/quiz/getquizbyid/${classId}`);
        console.log(response.data);
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
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
    <Box sx={{ p: 3 }}>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          All Quizzes
        </Typography>
        {role === "teacher" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Quiz
          </Button>
        )}
      </Box>

      {/* Quiz Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {role !== "student" && <TableCell />}
              <TableCell>Quiz Name</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration (min)</TableCell>
              {role === "student" ? (
                <TableCell>Start Quiz</TableCell>
              ) : (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((quiz, index) => (
              <React.Fragment key={quiz._id}>
                <TableRow>
                  {role !== "student" && (
                    <TableCell>
                      <IconButton
                        onClick={() => handleRowClick(index, quiz._id)}
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
                        value={editedData.quizname}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            quizname: e.target.value,
                          })
                        }
                      />
                    ) : (
                      quiz.quizname
                    )}
                  </TableCell>

                  <TableCell>
                    {role==='teacher'?<Button onClick={() => handleQuestionModalOpen(quiz)}>
                      {quiz.questionAnswerSet.length}
                    </Button>:
                    <Button >
                      {quiz.questionAnswerSet.length}
                    </Button>}
                  </TableCell>

                  <TableCell>
                    {editMode === quiz._id ? (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="Due Date"
                          value={editedData.duedate}
                          onChange={(newValue) =>
                            setEditedData({
                              ...editedData,
                              duedate: newValue,
                            })
                          }
                          slotProps={{ textField: { size: 'small' } }} // Updated prop
                        />
                      </LocalizationProvider>
                    ) : (
                      new Date(quiz.duedate).toLocaleString()
                    )}
                  </TableCell>

                  <TableCell>
                    {editMode === quiz._id ? (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="Start Time"
                          value={editedData.startTime}
                          onChange={(newValue) =>
                            setEditedData({
                              ...editedData,
                              startTime: newValue,
                            })
                          }
                          slotProps={{ textField: { size: 'small' } }} // Updated prop
                        />
                      </LocalizationProvider>
                    ) : (
                      new Date(quiz.startTime).toLocaleString()
                    )}
                  </TableCell>

                  <TableCell>
                    {editMode === quiz._id ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editedData.duration}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            duration: e.target.value,
                          })
                        }
                      />
                    ) : (
                      quiz.duration
                    )}
                  </TableCell>

                  {role === "student" ? (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStartQuiz(quiz._id)}
                      >
                        Start Quiz
                      </Button>
                    </TableCell>
                  ) : (
                    <TableCell>
                      {editMode === quiz._id ? (
                        <>
                          <IconButton onClick={() => handleSave(quiz._id)}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton onClick={handleCancel}>
                            <CloseIcon />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton onClick={() => handleEdit(quiz)}>
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                {role !== "student" && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{ paddingBottom: 0, paddingTop: 0 }}
                    >
                      <Collapse
                        in={openRows[index]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Registered Students:{" "}
                            {students[quiz._id]
                              ? students[quiz._id].length
                              : 0}
                          </Typography>

                          {students[quiz._id] ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Total Questions</TableCell>
                                  <TableCell>Questions Attempted</TableCell>
                                  <TableCell>Date/Time</TableCell>
                                  <TableCell>Score</TableCell>
                                  <TableCell>Details</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {students[quiz._id].map((student) => (
                                  <TableRow key={student._id}>
                                    <TableCell>{student.studentName}</TableCell>
                                    <TableCell>{student.totalQuestions}</TableCell>
                                    <TableCell>
                                      {student.questionAnswerSet.length}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(student.dateofquiz).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{student.overallMark}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                          setSelectedStudent(student);
                                          setIsStudentModalOpen(true);
                                        }}
                                      >
                                        Details
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography>No students registered yet.</Typography>
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

      {/* Create Quiz Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          <CreateQuiz onClose={() => setIsModalOpen(false)} classId={classId} />
        </Box>
      </Modal>

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        open={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />

      {/* Question Details Modal */}
      <QuestionDetailsModal
        quiz={selectedQuiz}
        open={isQuestionModalOpen}
        onClose={handleQuestionModalClose}
      />
    </Box>
  );
};

// Modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: "800px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

export default QuizManagement;