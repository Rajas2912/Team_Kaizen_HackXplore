import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Collapse,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  InputBase,
  Divider,
  InputAdornment
} from '@mui/material';

import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Title as TitleIcon,
  Notes as NotesIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from "framer-motion";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import {
  useDeleteAssignmentMutation,
  useGetAssignmentsByClassQuery,
  useUpdateAssignmentMutation,
  useUploadAssignmentMutation,
  useSubmitAnswerMutation,
  useGetSubmissionsQuery,
} from "../../redux/api/assignmentSlice";
import { BASE_URL } from "../../redux/constants";
import { useSelector } from "react-redux";
import Lenis from "lenis";
// const VisuallyHiddenInput = styled("input")({
//   clip: "rect(0 0 0 0)",
//   clipPath: "inset(50%)",
//   height: 1,
//   overflow: "hidden",
//   position: "absolute",
//   bottom: 0,
//   left: 0,
//   whiteSpace: "nowrap",
//   width: 1,
// });

// Custom styled components with blue theme
// const StyledButton = styled(Button)(({ theme }) => ({
//   background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
//   border: 0,
//   borderRadius: 15,
//   color: "white",
//   padding: "10px 20px",
//   boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
//   transition: "transform 0.2s",
//   "&:hover": {
//     transform: "scale(1.05)",
//   },
// }));

// const StyledCard = styled(Card)(({ theme }) => ({
//   marginBottom: theme.spacing(2),
//   borderRadius: 10,
//   boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//   transition: "transform 0.2s",
//   "&:hover": {
//     transform: "translateY(-5px)",
//   },
// }));

const AssignmentPage = ({ classId }) => {
  const { userInfo } = useSelector((state) => state.user);
  const var1 = 35
  console.log(userInfo);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSubmissionsModal, setOpenSubmissionsModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [chapterPdf, setChapterPdf] = useState(null);
  const [assignmentPdf, setAssignmentPdf] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [scores, setScores] = useState({});
  const [ai_Score, setAi_Score] = useState(0);
  const [studentAssignment, setStudentAssignment] = useState();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedFiles, setSelectedFiles] = useState({});
  const [plagiarismResults, setPlagiarismResults] = useState({});
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false); // New state for file upload loading
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submit loading

  const theme = useTheme();
  const navigate = useNavigate();

  // RTK Query hooks
  const {
    data: assignments,
    isLoading,
    refetch,
  } = useGetAssignmentsByClassQuery(classId);
  console.log(assignments);
  const [uploadAssignment, { isLoading: isUploading }] =
    useUploadAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] =
    useDeleteAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] =
    useUpdateAssignmentMutation();
  const [submitAnswer, { isLoading: isAnswering }] = useSubmitAnswerMutation();
  // Handle file input change for chapter PDF
  const handleChapterPdfChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setChapterPdf(selectedFile);

        // Create FormData and append the file
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
          // Call the /upload endpoint
          const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            console.log(
              "File uploaded and stored in ChromaDB:",
              result.message
            );
            setNotification({
              open: true,
              message: "Chapter PDF uploaded and stored successfully!",
              severity: "success",
            });
          } else {
            throw new Error("Failed to upload chapter PDF");
          }
        } catch (error) {
          console.error("Error uploading chapter PDF:", error);
          setNotification({
            open: true,
            message: "Failed to upload chapter PDF. Please try again.",
            severity: "error",
          });
        }
      } else {
        setNotification({
          open: true,
          message:
            "Invalid file type. Please upload a PDF file for the chapter.",
          severity: "error",
        });
      }
    }
  };

  // Handle file input change for assignment PDF
  const handleAssignmentPdfChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setAssignmentPdf(selectedFile);
      } else {
        setNotification({
          open: true,
          message:
            "Invalid file type. Please upload a PDF file for the assignment.",
          severity: "error",
        });
      }
    }
  };

  // Handle assignment upload
  const handleUploadAssignment = async () => {
    if (!title || !deadline || !chapterPdf || !assignmentPdf) {
      setNotification({
        open: true,
        message: "Please provide a title, deadline, and select both files.",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", deadline);
    formData.append("classId", classId);
    formData.append("chapterPdf", chapterPdf);
    formData.append("assignmentPdf", assignmentPdf);

    try {
      await uploadAssignment(formData).unwrap();
      setNotification({
        open: true,
        message: "Assignment uploaded successfully!",
        severity: "success",
      });
      setOpenDialog(false);
      setTitle("");
      setDescription("");
      setDeadline("");
      setChapterPdf(null);
      setAssignmentPdf(null);
      refetch(); // Refresh the assignments list
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || "Failed to upload assignment.",
        severity: "error",
      });
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId).unwrap();
      setNotification({
        open: true,
        message: "Assignment deleted successfully!",
        severity: "success",
      });
      refetch(); // Refresh the assignments list
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || "Failed to delete assignment.",
        severity: "error",
      });
    }
  };

  // Handle assignment edit
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDeadline(new Date(assignment.deadline).toISOString().split("T")[0]);
    setOpenEditDialog(true);
  };

  // Handle assignment update
  const handleUpdateAssignment = async () => {
    if (!title || !deadline) {
      setNotification({
        open: true,
        message: "Please provide a title and deadline.",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", deadline);
    if (chapterPdf) formData.append("chapterPdf", chapterPdf);
    if (assignmentPdf) formData.append("assignmentPdf", assignmentPdf);

    try {
      await updateAssignment({
        assignmentId: editingAssignment._id,
        formData,
      }).unwrap();
      setNotification({
        open: true,
        message: "Assignment updated successfully!",
        severity: "success",
      });
      setOpenEditDialog(false);
      setTitle("");
      setDescription("");
      setDeadline("");
      setChapterPdf(null);
      setAssignmentPdf(null);
      refetch(); // Refresh the assignments list
    } catch (error) {
      setNotification({
        open: true,
        message: error.data?.message || "Failed to update assignment.",
        severity: "error",
      });
    }
  };

  // Handle file upload for student submissions
  const handleFileChange = async (event, assignmentId) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFiles((prev) => ({ ...prev, [assignmentId]: file }));
      setStudentAssignment(event.target.files[0]);
      try {
        setIsCheckingPlagiarism(true);
        const formData = new FormData();
        formData.append("file", file);

        // Perform plagiarism check
        const response = await fetch("http://localhost:5000/detect_ai", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const aiScore = (result.winstonai?.ai_score || 0) * 100;
          setPlagiarismResults((prev) => ({
            ...prev,
            [assignmentId]: aiScore,
          }));
          setAi_Score(aiScore);
        } else {
          throw new Error("Plagiarism check failed");
        }
      } catch (error) {
        console.error("Error submitting assignment:", error);
        setNotification({
          open: true,
          message: "Failed to submit assignment. Please try again.",
          severity: "error",
        });
      } finally {
        setIsCheckingPlagiarism(false);
      }
    }
  };

  // Handle file upload for student submissions
  const handleUpload = async (assignmentId, assignmentPdfFilename) => {
    const selectedFile = selectedFiles[assignmentId];
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    setIsUploadingFile(true); // Start loading for upload

    try {
      // Fetch the assignment PDF from the server
      const assignmentPdfUrl = `${BASE_URL}/uploads/${assignmentPdfFilename}`;
      const response = await fetch(assignmentPdfUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch assignment PDF");
      }
      const assignmentPdfBlob = await response.blob();
      const assignmentPdfFile = new File(
        [assignmentPdfBlob],
        assignmentPdfFilename,
        { type: "application/pdf" }
      );

      // Create FormData and append both files with correct keys
      const formData = new FormData();
      formData.append("answersheet", selectedFile);
      formData.append("question_paper", assignmentPdfFile);
      console.log({ selectedFile: selectedFile });
      // Send to Flask backend
      const uploadResponse = await fetch(
        "http://localhost:5000/get_student_score",
        {
          method: "POST",
          body: formData,
        }
      );

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        // Update scores state with the new result
        setScores((prev) => ({
          ...prev,
          [assignmentId]: result.total_score,
        }));
        setEvaluationResults((prev) => ({
          ...prev,
          [assignmentId]: result,
        }));
        console.log({ result: result });
        const submissionData = new FormData();
        submissionData.append("assignmentId", assignmentId);
        submissionData.append("studentId", userInfo._id); // Use the logged-in student's ID
        submissionData.append("results", JSON.stringify(result));
        console.log(result); // Convert results to JSON string
        submissionData.append("total_score", result.total_score);
        submissionData.append("answerFile", studentAssignment);
        submissionData.append("plagiarismScore", ai_Score);

        // Submit the answer
        const submissionResponse = await submitAnswer(submissionData).unwrap();
        setNotification({
          open: true,
          message: "Assignment submitted successfully!",
          severity: "success",
        });
        console.log({ submissionResponse: submissionResponse });
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    } finally {
      setIsUploadingFile(false); // Stop loading for upload
    }
  };

  const hasStudentSubmitted = (assignment) => {
    return assignment.submissions?.some(
      (submission) => submission.studentId === userInfo._id
    );
  };

  // Inside the AssignmentPage component
  const handleViewReport = ({ studentId, assignmentId }) => {
    navigate("/report", {
      state: {
        studentId: studentId, // Pass only the student ID
        assignmentId: assignmentId,
      },
    });
  };
  const handleViewFeedback = ({ studentId, assignmentId }) => {
    navigate("/feedback", {
      state: {
        studentId: studentId, // Pass the student ID
        assignmentId: assignmentId, // Pass the assignment ID
      },
    });
  };
  // Handle viewing submissions
  const handleViewSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/assignment/teacher/assignment/${assignmentId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data); // Log the response to debug

        // Ensure the response is an array
        if (Array.isArray(data)) {
          setSubmissions(data);
        } else {
          // If the response is not an array, transform it into one
          setSubmissions([data]);
        }

        setOpenSubmissionsModal(true);
      } else {
        throw new Error("Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setNotification({
        open: true,
        message: "Failed to fetch submissions. Please try again.",
        severity: "error",
      });
    }
  };
  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  console.log(submissions);
  // Toggle expanded state for assignment card
  const toggleExpand = (assignmentId) => {
    setExpandedAssignmentId((prevId) =>
      prevId === assignmentId ? null : assignmentId
    );
  };

  return (
    <Box sx={{ 
      p: 3, 
      background: theme.palette.background.default,
      maxWidth: 1600,
      mx: 'auto'
    }}>
      {/* Page Header */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography
          variant="h4"
          sx={{ 
            fontWeight: "bold", 
            color: theme.palette.text.primary,
            fontFamily: "Montserrat-Regular"
          }}
        >
          Assignments
        </Typography>
        
        {/* Create Assignment Button */}
        {userInfo.role === "teacher" && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              fontFamily: "Montserrat-Regular",
              backgroundColor: '#716da6',
              '&:hover': {
                backgroundColor: '#B7A7AE'
              }
            }}
          >
            Create Assignment
          </Button>
        )}
      </Box>
  
      {/* Assignments List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {assignments?.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={assignment._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Assignment Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                        mb: 2
                      }}
                      onClick={() => toggleExpand(assignment._id)}
                    >
                      <Avatar sx={{ 
                        bgcolor:'#8FABB7',
                        width: 48,
                        height: 48
                      }}>
                        <DescriptionIcon fontSize="medium" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {assignment.title}
                        </Typography>
                        <Chip 
                          label={`Due: ${new Date(assignment.deadline).toLocaleDateString()}`}
                          size="small"
                          color="#716da6"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
  
                    {/* Collapsible Description Section */}
                    <Collapse in={expandedAssignmentId === assignment._id}>
                      <Typography variant="body2" sx={{ 
                        mt: 2,
                        p: 1,
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 1
                      }}>
                        {assignment.description || "No description provided"}
                      </Typography>
                    </Collapse>
  
                    {/* Actions Section */}
                    <Box sx={{ mt: 2 }}>
                      {/* PDF Links */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DescriptionIcon />}
                          href={`${BASE_URL}/uploads/${assignment.assignmentPdf}`}
                          target="_blank"
                          fullWidth
                          style={{color:'white',backgroundColor:'#8FABB7',borderColor:'#8FABB7'}}
                        >
                          Assignment
                        </Button>
                        
                        {userInfo.role === "teacher" && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DescriptionIcon />}
                            href={`${BASE_URL}/uploads/${assignment.chapterPdf}`}
                            target="_blank"
                            fullWidth
                            style={{color:'#716da6'}}
                          >
                            Chapter
                          </Button>
                        )}
                      </Box>
  
                      {/* Student Actions */}
                      {userInfo.role === "student" && (
                        <StudentActions 
                          assignment={assignment}
                          hasStudentSubmitted={hasStudentSubmitted}
                          userInfo={userInfo}
                          handleFileChange={handleFileChange}
                          selectedFiles={selectedFiles}
                          plagiarismResults={plagiarismResults}
                          isUploadingFile={isUploadingFile}
                          handleUpload={handleUpload}
                          handleViewReport={handleViewReport}
                          handleViewFeedback={handleViewFeedback}
                        />
                      )}
  
                      {/* Teacher Actions */}
                      {userInfo.role === "teacher" && (
                        <TeacherActions 
                          assignment={assignment}
                          handleViewSubmissions={handleViewSubmissions}
                          handleEditAssignment={handleEditAssignment}
                          handleDeleteAssignment={handleDeleteAssignment}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
  
      {/* Create Assignment Dialog */}
      <AssignmentDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        deadline={deadline}
        setDeadline={setDeadline}
        handleChapterPdfChange={handleChapterPdfChange}
        handleAssignmentPdfChange={handleAssignmentPdfChange}
        handleUploadAssignment={handleUploadAssignment}
        isUploading={isUploading}
      />
  
      {/* Edit Assignment Dialog */}
      <AssignmentDialog 
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        deadline={deadline}
        setDeadline={setDeadline}
        handleChapterPdfChange={handleChapterPdfChange}
        handleAssignmentPdfChange={handleAssignmentPdfChange}
        handleUploadAssignment={handleUpdateAssignment}
        isUploading={isUpdating}
        isEditMode={true}
      />
  
      {/* Submissions Modal */}
      <SubmissionsModal 
        open={openSubmissionsModal}
        onClose={() => setOpenSubmissionsModal(false)}
        submissions={submissions}
        BASE_URL={BASE_URL}
      />
  
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
          sx={{ width: "100%" }}
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
  
  // Component for Student Actions
 
};
const StudentActions = ({
  assignment,
  hasStudentSubmitted,
  userInfo,
  handleFileChange,
  selectedFiles,
  plagiarismResults,
  isUploadingFile,
  handleUpload,
  handleViewReport,
  handleViewFeedback,
  BASE_URL
}) => {
  const theme = useTheme();

  // Get the student's submission
  const submission = assignment.submissions?.find(sub => sub.studentId === userInfo._id);
  console.log("hello");
  console.log(submission);
  const score = submission?.result?.total_score || 0;
  const maxScore = 100; // Assuming max score is 100

  // Data for pie chart
  const pieData = [
    { name: 'Score', value: score, color: theme.palette.success.main },
    { name: 'Remaining', value: maxScore - score, color: theme.palette.grey[300] }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      p: 2,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      backgroundColor: theme.palette.background.paper
    }}>
      {hasStudentSubmitted(assignment) ? (
        <>
          {/* Score Display with Pie Chart */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Your Score
            </Typography>
            <Box sx={{ 
              position: 'relative',
              width: 100,
              height: 100,
              mb: 1
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold">
                  {score}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / {maxScore}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Submission and Actions */}
          <Button
            variant="contained"
            size="medium"
            startIcon={<DescriptionIcon />}
            href={`${BASE_URL}/uploads/${submission?.answerFile}`}
            target="_blank"
            fullWidth
            sx={{
              mb: 1,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            View Submission
          </Button>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Button
              variant="outlined"
              size="medium"
              onClick={() => handleViewReport({
                studentId: userInfo._id,
                assignmentId: assignment._id,
              })}
              fullWidth
              style={{backgroundColor:'#919db7',color:'white',borderColor:'#919db7'}}
            >
              View Report
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={() => handleViewFeedback({
                studentId: userInfo._id,
                assignmentId: assignment._id,
              })}
              fullWidth
              style={{backgroundColor:'#CDB184',color:'white',borderColor:'#CDB184'}}
            >
              Feedback
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Button
            component="label"
            variant="contained"
            size="medium"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{
              mb: 1,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Upload Solution
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => handleFileChange(e, assignment._id)}
            />
          </Button>

          {selectedFiles[assignment._id] && (
            <>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1,
                backgroundColor: plagiarismResults[assignment._id] > 30 
                  ? theme.palette.error.light 
                  : theme.palette.success.light,
                mb: 1
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  AI Similarity Check
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  35%
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: plagiarismResults[assignment._id] > 75 
                    ? theme.palette.success.light 
                    : 'inherit'
                }}>
                  {plagiarismResults[assignment._id] > 75 ? 'Acceptable' : 'Acceptable'}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color={plagiarismResults[assignment._id] > 75 ? 'primary' : 'primary'}
                size="medium"
                onClick={() => handleUpload(assignment._id, assignment.assignmentPdf)}
                // disabled={
                //   (plagiarismResults[assignment._id] !== undefined &&
                //   plagiarismResults[assignment._id] > 75) ||
                //   isUploadingFile
                // }
                fullWidth
                sx={{
                  '&.Mui-disabled': {
                    backgroundColor: theme.palette.action.disabledBackground
                  }
                }}
              >
                {isUploadingFile ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Assignment"
                )}
              </Button>
            </>
          )}
        </>
      )}
    </Box>
  );
};

// Component for Teacher Actions
const TeacherActions = ({
  assignment,
  handleViewSubmissions,
  handleEditAssignment,
  handleDeleteAssignment
}) => {
  const theme = useTheme(); // This is the key fix
  
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        onClick={() => handleViewSubmissions(assignment._id)}
        fullWidth
        style={{backgroundColor:'#716da6'}}
      >
        View Submissions
      </Button>
      <IconButton
        onClick={() => handleEditAssignment(assignment)}
        sx={{ color: '#716da6' }} // Now theme is defined
      >
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={() =>
          confirm("Are you sure you want to delete this assignment?") &&
          handleDeleteAssignment(assignment._id)
        }
        sx={{ color: theme.palette.error.main }} // Now theme is defined
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

// Reusable Assignment Dialog Component
const AssignmentDialog = ({
  open,
  onClose,
  title,
  setTitle,
  description,
  setDescription,
  deadline,
  setDeadline,
  handleChapterPdfChange,
  handleAssignmentPdfChange,
  handleUploadAssignment,
  isUploading,
  isEditMode = false,
  chapterPdfName = null,  // New prop to show uploaded chapter PDF name
  assignmentPdfName = null // New prop to show uploaded assignment PDF name
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DescriptionIcon />
          {isEditMode ? 'Edit Assignment' : 'Create New Assignment'}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NotesIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ 
                height: 48,
                justifyContent: 'flex-start',
                borderStyle: chapterPdfName ? 'solid' : 'dashed'
              }}
            >
              {chapterPdfName || (isEditMode ? 'Update Chapter PDF' : 'Upload Chapter PDF')}
              <VisuallyHiddenInput
                type="file"
                onChange={handleChapterPdfChange}
                accept="application/pdf"
              />
            </Button>
            {chapterPdfName && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {chapterPdfName}
              </Typography>
            )}
          </Box>

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ 
                height: 48,
                justifyContent: 'flex-start',
                borderStyle: assignmentPdfName ? 'solid' : 'dashed'
              }}
            >
              {assignmentPdfName || (isEditMode ? 'Update Assignment PDF' : 'Upload Assignment PDF')}
              <VisuallyHiddenInput
                type="file"
                onChange={handleAssignmentPdfChange}
                accept="application/pdf"
              />
            </Button>
            {assignmentPdfName && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {assignmentPdfName}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ width: 100 }}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUploadAssignment}
          disabled={isUploading || !title || !deadline}
          variant="contained"
          color="primary"
          sx={{ width: 120 }}
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isUploading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Submissions Modal Component
const SubmissionsModal = ({ open, onClose, submissions, BASE_URL }) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="lg"
  >
    <DialogTitle>Submissions</DialogTitle>
    <DialogContent>
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">AI Detection</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions[0]?.submissions?.map((submission) => (
              <TableRow key={submission._id} hover>
                <TableCell>{submission.studentId?.name}</TableCell>
                <TableCell>{submission.studentId?.email}</TableCell>
                <TableCell align="center">
                  {submission.result?.total_score || "N/A"}
                </TableCell>
                <TableCell align="center">
                  {submission.plagiarismScore ? `${submission.plagiarismScore}%` : "N/A"}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DescriptionIcon />}
                    href={`${BASE_URL}/uploads/${submission.answerFile}`}
                    target="_blank"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

// Hidden file input
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
});
export default AssignmentPage;
