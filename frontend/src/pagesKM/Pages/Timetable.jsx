import React, { useState, useMemo } from 'react'
import {
  useDeleteTimetableByUserIdMutation,
  useGetTimetableByUserIdQuery,
  useSaveTimetableMutation,
  useUpdateScheduleItemsMutation,
} from '../../redux/api/timetableApiSlice'
import { useSelector } from 'react-redux'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Button,
  Box,
  Toolbar,
  AppBar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const Timetable = () => {
  const { userInfo } = useSelector((state) => state.user)
  const {
    data: timetable,
    isLoading,
    isError,
  } = useGetTimetableByUserIdQuery(userInfo?._id)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [anchorEl, setAnchorEl] = useState(null) // State for dropdown menu
  const [updateSchedule] = useUpdateScheduleItemsMutation()
  const [editingIndex, setEditingIndex] = useState(null) // Track which row is being edited
  const [editedSchedule, setEditedSchedule] = useState([]) // Store edited schedule data

  // Access the schedule from the timetable data
  const schedule = timetable?.data?.schedule || []

  // Sorting function using useMemo
  const sortedSchedule = useMemo(() => {
    if (sortConfig.key) {
      return [...schedule].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return schedule
  }, [schedule, sortConfig])

  // Handle column sorting
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedSchedule)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable')
    XLSX.writeFile(workbook, 'timetable.xlsx')
    handleCloseMenu() // Close the dropdown menu after export
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.autoTable({
      head: [['Date', 'Day', 'Hours', 'Topic']],
      body: sortedSchedule.map((item) => [
        item.date,
        item.day,
        item.hours,
        item.topic,
      ]),
    })
    doc.save('timetable.pdf')
    handleCloseMenu() // Close the dropdown menu after export
  }

  // Handle dropdown menu open
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  // Handle dropdown menu close
  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  // Handle edit button click
  const handleEdit = (index) => {
    setEditingIndex(index)
    setEditedSchedule([...schedule]) // Create a copy of the schedule for editing
  }

  // Handle save button click
  const handleSave = async () => {
    try {
      await updateSchedule({
        userId: userInfo?._id,
        updates: editedSchedule,
      }).unwrap()
      setEditingIndex(null) // Exit edit mode
      setNotification({
        open: true,
        message: 'Timetable updated successfully!',
        severity: 'success',
      })
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update timetable. Please try again.',
        severity: 'error',
      })
    }
  }

  // Handle cancel button click
  const handleCancel = () => {
    setEditingIndex(null) // Exit edit mode without saving
  }

  // Handle input changes in editable fields
  const handleInputChange = (index, field, value) => {
    const updatedSchedule = [...editedSchedule]
    updatedSchedule[index][field] = value
    setEditedSchedule(updatedSchedule)
  }

  if (isLoading) {
    return <CircularProgress />
  }

  if (isError) {
    return <Typography color="primary">No schedule planned</Typography>
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar with Heading and Export Buttons */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Timetable
          </Typography>
          {/* Download Dropdown */}
          {schedule.length > 0 && (
            <Tooltip title="Download Options">
              <IconButton color="primary" onClick={handleOpenMenu}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleExportExcel}>Download as Excel</MenuItem>
            <MenuItem onClick={handleExportPDF}>Download as PDF</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Table or No Schedule Message */}
      {schedule.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('date')}
                >
                  Date <SortIcon fontSize="small" />
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('day')}
                >
                  Day <SortIcon fontSize="small" />
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('hours')}
                >
                  Hours <SortIcon fontSize="small" />
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('topic')}
                >
                  Topic <SortIcon fontSize="small" />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSchedule.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {editingIndex === index ? (
                      <TextField
                        value={editedSchedule[index].date}
                        onChange={(e) =>
                          handleInputChange(index, 'date', e.target.value)
                        }
                      />
                    ) : (
                      item.date
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <TextField
                        value={editedSchedule[index].day}
                        onChange={(e) =>
                          handleInputChange(index, 'day', e.target.value)
                        }
                      />
                    ) : (
                      item.day
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <TextField
                        type="number"
                        value={editedSchedule[index].hours}
                        onChange={(e) =>
                          handleInputChange(index, 'hours', e.target.value)
                        }
                      />
                    ) : (
                      item.hours
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <TextField
                        value={editedSchedule[index].topic}
                        onChange={(e) =>
                          handleInputChange(index, 'topic', e.target.value)
                        }
                      />
                    ) : (
                      item.topic
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <>
                        <IconButton onClick={handleSave}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancel}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton onClick={() => handleEdit(index)}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" sx={{ mt: 3, textAlign: 'center' }}>
          No schedule yet
        </Typography>
      )}
    </Box>
  )
}

export default Timetable
