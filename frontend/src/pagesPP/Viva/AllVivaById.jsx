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
  FormControlLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import CreateViva from "./CreateViva";

const API = import.meta.env.VITE_BACKEND_URL;

const AllVivaById = ({ classId }) => {
  const [vivas, setVivas] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [students, setStudents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const fetchAllVivas = async () => {
      try {
        const response = await axios.get(`${API}/viva/getallViva/${classId}`);
        setVivas(response.data);
      } catch (error) {
        console.error("Error fetching vivas:", error);
      }
    };
    fetchAllVivas();
  }, [classId]);

  const fetchRegisteredStudents = async (vivaId) => {
    try {
      const response = await axios.get(`${API}/vivaresult/getvivaresult/${vivaId}`);
      console.log(response);
      setStudents((prev) => ({ ...prev, [vivaId]: response.data.data }));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleRowClick = (index, vivaId) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!students[vivaId]) fetchRegisteredStudents(vivaId);
    console.log(vivaId)
  };

  const handleStatusChange = async (vivaId, newStatus) => {
    try {
      await axios.put(`${API}/viva/updateViva/${vivaId}`, { status: newStatus });
      setVivas((prev) =>
        prev.map((viva) => (viva._id === vivaId ? { ...viva, status: newStatus } : viva))
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
  

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">All Vivas</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
            Create Viva
          </Button>
        </Box>
      </Box>

      {/* Viva Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Viva Name</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Thinking Time (min)</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vivas.filter(viva => statusFilter === "all" || viva.status === statusFilter).map((viva, index) => (
              <React.Fragment key={viva._id}>
                <TableRow>
                  <TableCell>
                    <IconButton onClick={() => handleRowClick(index, viva._id)}>
                      {openRows[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>

                  <TableCell>
                    {editMode === viva._id ? (
                      <TextField size="small" value={editedData.vivaname} onChange={(e) => setEditedData({ ...editedData, vivaname: e.target.value })} />
                    ) : viva.vivaname}
                  </TableCell>

                  <TableCell>{viva.questionAnswerSet.length}</TableCell>

                  <TableCell>
                    {editMode === viva._id ? (
                      <TextField size="small" type="number" value={editedData.timeofthinking} onChange={(e) => setEditedData({ ...editedData, timeofthinking: e.target.value })} />
                    ) : viva.timeofthinking}
                  </TableCell>

                  <TableCell>
                    {editMode === viva._id ? (
                      <TextField size="small" type="date" value={editedData.updatedAt.split("T")[0]} onChange={(e) => setEditedData({ ...editedData, updatedAt: e.target.value })} />
                    ) : new Date(viva.updatedAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <RadioGroup row>
                      <FormControlLabel
                        control={<Radio checked={viva.status === "Active"} onChange={() => handleStatusChange(viva._id, "Active")} />}
                        label="Active"
                      />
                      <FormControlLabel
                        control={<Radio checked={viva.status === "Inactive"} onChange={() => handleStatusChange(viva._id, "Inactive")} />}
                        label="Inactive"
                      />
                    </RadioGroup>
                  </TableCell>
                  <TableCell>
                    {editMode === viva._id ? (
                      <>
                        <IconButton onClick={() => handleSave(viva._id)}><SaveIcon /></IconButton>
                        <IconButton onClick={handleCancel}><CloseIcon /></IconButton>
                      </>
                    ) : (
                      <IconButton onClick={() => handleEdit(viva)}><EditIcon /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Registered Students
                        </Typography>
                        {students[viva._id] ? (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Score</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                            {Array.isArray(students[viva._id]) ? (
  students[viva._id].map((student) => (
    <TableRow key={student._id}>
      <TableCell>{student.name}</TableCell>
      <TableCell>{student.score}</TableCell>
    </TableRow>
  ))
) : (
  <Typography>No students registered yet.</Typography>
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
    </Box>
  );
};

const modalStyle = {
  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
  width: "35%", height: "600px", bgcolor: "white", boxShadow: 24, p: 4, borderRadius: 2, overflowY: "auto"
};

export default AllVivaById;
