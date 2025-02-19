import React, { useState, useMemo } from 'react'
import { useGetAllStudentsWithClassInfoQuery } from '../../redux/api/classApiSlice'
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
} from '@mui/material'
import { Download as DownloadIcon, Sort as SortIcon } from '@mui/icons-material'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const UsersPage = () => {
  const { data, isLoading, isError } = useGetAllStudentsWithClassInfoQuery()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [anchorEl, setAnchorEl] = useState(null) // State for dropdown menu

  // Access the array of students from the `data` property
  const students = data?.data || []

  // Sorting function using useMemo
  const sortedStudents = useMemo(() => {
    if (sortConfig.key) {
      return [...students].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return students
  }, [students, sortConfig])

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
    const worksheet = XLSX.utils.json_to_sheet(sortedStudents)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    XLSX.writeFile(workbook, 'students.xlsx')
    handleCloseMenu() // Close the dropdown menu after export
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.autoTable({
      head: [['Student Name', 'Student Email', 'Class Name']],
      body: sortedStudents.map((student) => [
        student.studentName,
        student.studentEmail,
        student.className,
      ]),
    })
    doc.save('students.pdf')
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

  if (isLoading) {
    return <CircularProgress />
  }

  if (isError) {
    return <Typography color="error">Error loading data</Typography>
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar with Heading and Export Buttons */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Students
          </Typography>
          {/* Download Dropdown */}
          <Tooltip title="Download Options">
            <IconButton color="primary" onClick={handleOpenMenu}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
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

      {/* Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('studentName')}
              >
                Student Name <SortIcon fontSize="small" />
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('studentEmail')}
              >
                Student Email <SortIcon fontSize="small" />
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => handleSort('className')}
              >
                Class Name <SortIcon fontSize="small" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStudents.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.studentName}</TableCell>
                <TableCell>{student.studentEmail}</TableCell>
                <TableCell>{student.className}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default UsersPage
