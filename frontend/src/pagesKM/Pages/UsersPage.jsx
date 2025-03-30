import React, { useState, useMemo } from 'react';
import { useGetAllStudentsWithClassInfoQuery } from '../../redux/api/classApiSlice';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Chip,
  useTheme,
  Avatar,
  Stack,
  TextField,
  InputAdornment,Grid
} from '@mui/material';
import {
  Download as DownloadIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { visuallyHidden } from '@mui/utils';

const UsersPage = () => {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useGetAllStudentsWithClassInfoQuery();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Access the array of students from the `data` property
  const students = data?.data || [];

  // Sorting and filtering function using useMemo
  const sortedStudents = useMemo(() => {
    let filteredStudents = [...students];
    
    // Apply search filter
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredStudents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredStudents;
  }, [students, sortConfig, searchTerm]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students.xlsx');
    handleCloseMenu();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Student Name', 'Student Email', 'Class Name']],
      body: sortedStudents.map((student) => [
        student.studentName,
        student.studentEmail,
        student.className,
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 2,
        halign: 'left'
      },
      headStyles: {
        fillColor: [theme.palette.primary.main],
        textColor: 255,
        fontStyle: 'bold'
      }
    });
    doc.save('students.pdf');
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h6">
          Error loading student data. Please try again.
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<RefreshIcon />}
          onClick={refetch}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
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
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          Student Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search students..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{
              textTransform: 'none'
            }}
            style={{color:'#B7A7AE',border: 'solid 2px #B7A7AE'}}
          >
            Filters
          </Button>
          
          <Tooltip title="Download Options">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleOpenMenu}
              sx={{
                borderRadius: '8px',
                textTransform: 'none'
              }}
              style={{backgroundColor:'#B7A7AE'}}
            >
              Export
            </Button>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: {
                borderRadius: '8px',
                boxShadow: theme.shadows[3],
                minWidth: 200
              }
            }}
          >
            <MenuItem 
              onClick={handleExportExcel}
              sx={{ borderRadius: '4px', m: 0.5 }}
            >
              Export as Excel
            </MenuItem>
            <MenuItem 
              onClick={handleExportPDF}
              sx={{ borderRadius: '4px', m: 0.5 }}
            >
              Export as PDF
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {students.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${theme.palette.secondary.main}`
            }}>
              <Typography variant="body2" color="text.secondary">
                Unique Classes
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {new Set(students.map(s => s.className)).size}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Students Table */}
      <Paper sx={{ 
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: '#9793c6',
                '& th': {
                  color: 'white',
                  fontWeight: 600
                }
              }}>
                <TableCell
                  onClick={() => handleSort('studentName')}
                  sx={{ cursor: 'pointer', minWidth: 200 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Student Name</span>
                    <SortIcon fontSize="small" />
                    {sortConfig.key === 'studentName' && (
                      <span style={visuallyHidden}>
                        {sortConfig.direction === 'asc' ? 'sorted ascending' : 'sorted descending'}
                      </span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('studentEmail')}
                  sx={{ cursor: 'pointer', minWidth: 250 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Email</span>
                    <SortIcon fontSize="small" />
                    {sortConfig.key === 'studentEmail' && (
                      <span style={visuallyHidden}>
                        {sortConfig.direction === 'asc' ? 'sorted ascending' : 'sorted descending'}
                      </span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('className')}
                  sx={{ cursor: 'pointer', minWidth: 200 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Class</span>
                    <SortIcon fontSize="small" />
                    {sortConfig.key === 'className' && (
                      <span style={visuallyHidden}>
                        {sortConfig.direction === 'asc' ? 'sorted ascending' : 'sorted descending'}
                      </span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedStudents.length > 0 ? (
                sortedStudents.map((student, index) => (
                  <TableRow 
                    key={index}
                    hover
                    sx={{ 
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: theme.palette.action.hover }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36,
                          backgroundColor: '#B7A7AE'
                        }}>
                          {student.studentName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {student.studentName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {student.studentEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.className}
                        size="small"
                        sx={{ 
                          backgroundColor: `'#9793c6'`,
                          color: '#716da6'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ 
                          backgroundColor: `${theme.palette.success.main}20`,
                          color: theme.palette.success.main
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'No matching students found' : 'No student data available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination would go here */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mt: 3,
        alignItems: 'center'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          Showing 1-{Math.min(10, sortedStudents.length)} of {sortedStudents.length} students
        </Typography>
        <Button size="small" disabled>
          Previous
        </Button>
        <Button size="small">
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default UsersPage;