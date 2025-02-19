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
  Select,
  MenuItem,
  TextField,
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
import CreateViva from "./CreateViva";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

const API = import.meta.env.VITE_BACKEND_URL;

const AllVivaById = ({ classId }) => {
  const [vivas, setVivas] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [students, setStudents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [role, setRole] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.user); // Access user role from Redux
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo?.role) {
      setRole(userInfo.role);
      // console.log("Role updated:", userInfo.role);
    }
  }, [userInfo?.role]);
  useEffect(() => {
    const fetchAllVivas = async () => {
      try {
        const response = await axios.get(`${API}/viva/getallViva/${classId}`);
        setVivas(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching vivas:", error);
      }
    };
    fetchAllVivas();
  }, [classId]);

  const fetchRegisteredStudents = async (vivaId) => {
    try {
      const response = await axios.get(
        `${API}/vivaresult/getvivaresult/${vivaId}`
      );
      console.log(response?.data?.data);
      setStudents((prev) => ({ ...prev, [vivaId]: response?.data }));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleRowClick = (index, vivaId) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!students[vivaId]) fetchRegisteredStudents(vivaId);
    console.log(vivaId);
  };

  const handleStatusChange = async (vivaId, newStatus) => {
    try {
      await axios.put(`${API}/viva/updateViva/${vivaId}`, {
        status: newStatus,
      });
      setVivas((prev) =>
        prev.map((viva) =>
          viva._id === vivaId ? { ...viva, status: newStatus } : viva
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (viva) => {
    setEditMode(viva._id);
    setEditedData({ ...viva });
  };

  const handleSave = async (vivaId) => {
    try {
      await axios.put(`${API}/viva/updateViva/${vivaId}`, editedData);
      setVivas((prev) =>
        prev.map((viva) => (viva._id === vivaId ? { ...editedData } : viva))
      );
      setEditMode(null);
    } catch (error) {
      console.error("Error updating viva:", error);
    }
  };

  const handleCancel = () => {
    setEditMode(null);
  };
  const handleStartViva=(vivaId)=>{
    navigate(`/takepicture/${vivaId}`);
  }

  const StudentDetailsModal = ({ student, open, onClose }) => {
    if (!student) return null;

    return (
      <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Student Details Section */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          Student Details
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Name:</strong> {student.studentName}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Viva ID:</strong> {student.vivaId}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Date of Viva:</strong>{" "}
          {new Date(student.dateOfViva).toLocaleString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Total Questions:</strong> {student.totalQuestions}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Questions Attempted:</strong>{" "}
          {student.questionAnswerSet.length}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Total mark :</strong>{" "}
          {student.overallMark}
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
                  <TableCell>{question.evaluation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Close Button */}
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
    <Box sx={{ p: 3 }} >
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
          All Vivas
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
          {role === "teacher" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Viva
            </Button>
          )}
        </Box>
      </Box>

      {/* Viva Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {role!=='student' &&<TableCell />}
              <TableCell>Viva Name</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Thinking Time (min)</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              {role === "student" ? (
                <TableCell>start Viva</TableCell>
              ) : (

                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {vivas
              .filter(
                (viva) => statusFilter === "all" || viva.status === statusFilter
              )
              .map((viva, index) => (
                <React.Fragment key={viva._id}>
                  <TableRow>
                    {role!=='student' &&<TableCell>
                      <IconButton
                        onClick={() => handleRowClick(index, viva._id)}
                      >
                        {openRows[index] ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>}

                    <TableCell>
                      {editMode === viva._id ? (
                        <TextField
                          size="small"
                          value={editedData.vivaname}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              vivaname: e.target.value,
                            })
                          }
                        />
                      ) : (
                        viva.vivaname
                      )}
                    </TableCell>

                    <TableCell>{viva.questionAnswerSet.length}</TableCell>

                    <TableCell>
                      {editMode === viva._id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editedData.timeofthinking}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              timeofthinking: e.target.value,
                            })
                          }
                        />
                      ) : (
                        viva.timeofthinking
                      )}
                    </TableCell>

                    <TableCell>
                      {editMode === viva._id ? (
                        <TextField
                          size="small"
                          type="date"
                          value={editedData.updatedAt.split("T")[0]}
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

                    <TableCell>
                      <RadioGroup row>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={viva.status !== "true"}
                              onChange={() =>
                                handleStatusChange(viva._id, "Active")
                              }
                              disabled={role === "student"}
                            />
                          }
                          label="Active"
                        />
                        <FormControlLabel
                          control={
                            <Radio
                              checked={viva.status === "true"}
                              onChange={() =>
                                handleStatusChange(viva._id, "Inactive")
                              }
                              disabled={role === "student"}
                            />
                          }
                          label="Inactive"
                        />
                      </RadioGroup>
                    </TableCell>
                    {role === "student" ? (
                      <TableCell>
                        <Button  variant="contained" color="primary" onClick={()=>handleStartViva(viva._id)}>
                          Start Viva
                        </Button>
                      </TableCell>
                    ) : (
                      <TableCell>
                        {editMode === viva._id ? (
                          <>
                            <IconButton onClick={() => handleSave(viva._id)}>
                              <SaveIcon />
                            </IconButton>
                            <IconButton onClick={handleCancel}>
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton onClick={() => handleEdit(viva)}>
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                  {
                    role!=='student' &&
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
                            {students[viva._id]
                              ? students[viva._id].data.length
                              : 0}
                          </Typography>

                          {students[viva._id] ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Total Question</TableCell>
                                  <TableCell>Total question atempted</TableCell>
                                  <TableCell>Date/time</TableCell>
                                  <TableCell>Score</TableCell>
                                  <TableCell>Details</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Array.isArray(students[viva._id]?.data) ? (
                                  students[viva._id].data.map((student) => (
                                    <TableRow key={student._id}>
                                      <TableCell>
                                        {student.studentName}
                                      </TableCell>
                                      <TableCell>
                                        {student.totalQuestions}
                                      </TableCell>
                                      <TableCell>
                                        {student.questionAnswerSet.length}
                                      </TableCell>
                                      <TableCell>
                                      {new Date(student.dateOfViva).toLocaleString()}
                                      </TableCell>
                                      <TableCell>
                                        {student.overallMark}
                                      </TableCell>
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
                                  ))
                                ) : (
                                  <Typography>
                                    No students registered yet.
                                  </Typography>
                                )}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography>No students registered yet.</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  }
                  
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default AllVivaById;
