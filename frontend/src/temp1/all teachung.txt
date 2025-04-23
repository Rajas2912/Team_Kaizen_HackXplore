import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Box,
  Button,
  Dialog,
  Card,
  CardContent,
  Typography,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import { 
  FaPlus,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaLock,
  FaGlobe
} from 'react-icons/fa';
import CreateClass from './CreateClass';
import {
  useGetAllClassesQuery,
  useJoinClassMutation,
  useGetAllPublicClassesQuery,
} from '../../redux/api/classApiSlice';

const AllTeaching = ({ navigate }) => {
  const theme = useTheme();
  const { userInfo } = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState('');

  // Fetch all classes for the logged-in user (teacher or student)
  const {
    data: userClasses,
    isLoading: isUserClassesLoading,
    error: userClassesError,
    refetch: refetchUserClasses,
  } = useGetAllClassesQuery(userInfo._id);

  // Fetch all public classes that the student has not joined
  const {
    data: publicClassesData,
    isLoading: isPublicClassesLoading,
    error: publicClassesError,
    refetch: refetchPublicClasses,
  } = useGetAllPublicClassesQuery({ userId: userInfo._id, role: userInfo.role });

  const [joinClass, { isLoading: isJoining }] = useJoinClassMutation();

  const handleJoinClass = async (classId = null) => {
    if (!classId && !classCode) {
      alert('Please enter a class code.');
      return;
    }

    try {
      const response = await joinClass({
        classCode,
        studentId: userInfo._id,
        classId,
      }).unwrap();
      alert(response.message);
      setIsJoinModalOpen(false);
      refetchUserClasses();
      refetchPublicClasses();
    } catch (error) {
      alert(error.data?.message || 'Failed to join class.');
    }
    setClassCode('');
  };

  const privateClasses = userClasses?.classes?.filter(
    (classItem) => !classItem.isPublic
  );

  const publicClasses = publicClassesData?.classes || [];

  if (isUserClassesLoading || isPublicClassesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  if (userClassesError || publicClassesError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">
          Error loading classes. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header and Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <FaChalkboardTeacher />
          My Classes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {userInfo.role === 'teacher' && (
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Create Class
            </Button>
          )}
          {userInfo.role === 'student' && (
            <Button
              variant="outlined"
              startIcon={<FaPlus />}
              onClick={() => setIsJoinModalOpen(true)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Join Private Class
            </Button>
          )}
        </Box>
      </Box>

      {/* Create Class Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <CreateClass
          refetch={refetchUserClasses}
          onClose={() => setIsModalOpen(false)}
        />
      </Dialog>

      {/* Join Private Class Dialog */}
      <Dialog
        open={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}>
          Join Private Class
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <TextField
            name="classCode"
            label="Enter Class Code"
            fullWidth
            margin="normal"
            variant="outlined"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setIsJoinModalOpen(false)}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleJoinClass()}
            disabled={isJoining}
            variant="contained"
            color="primary"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            {isJoining ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Joining...
              </>
            ) : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Private Classes Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <FaLock />
          Private Classes
        </Typography>
        
        {privateClasses?.length > 0 ? (
          <Grid container spacing={3}>
            {privateClasses.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem._id}>
                <Card
                  onClick={() => navigate(`/class/${classItem._id}`)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#B7A7AE',
                    color: 'white',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {classItem.name}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5
                    }}>
                      <FaUserGraduate size={16} />
                      <Typography variant="body2">
                        {classItem.teacher.name} ({classItem.teacher.email})
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5
                    }}>
                      <FaUsers size={16} />
                      <Typography variant="body2">
                        {classItem.students.length} students
                      </Typography>
                    </Box>
                    <Chip
                      label={`Code: ${classItem.classCode}`}
                      size="small"
                      sx={{ 
                        mt: 1,
                        backgroundColor: `#E1D5D9`,
                        color: 'black'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
          }}>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              No private classes available
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Public Classes Section */}
      {userInfo.role === 'student' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <FaGlobe />
            Available Public Classes
          </Typography>
          
          {publicClasses?.length > 0 ? (
            <Grid container spacing={3}>
              {publicClasses.map((classItem) => (
                <Grid item xs={12} sm={6} md={4} key={classItem._id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box sx={{
                      p: 2,
                      backgroundColor: '#ADA9BA' ,
                      color: 'white',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {classItem.name}
                      </Typography>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5
                      }}>
                        <FaUserGraduate size={16} />
                        <Typography variant="body2">
                          {classItem.teacher.name} ({classItem.teacher.email})
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5
                      }}>
                        <FaUsers size={16} />
                        <Typography variant="body2">
                          {classItem.students.length} students
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleJoinClass(classItem._id)}
                        disabled={isJoining}
                        style={{backgroundColor:'#393A5A'}}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none'
                        }}
                      >
                        {isJoining ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Joining...
                          </>
                        ) : 'Join Class'}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper
            }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                No public classes available to join
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AllTeaching;