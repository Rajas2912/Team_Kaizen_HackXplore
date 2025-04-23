import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Avatar,
  Input,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CameraAlt as CameraIcon,
  School as StudentIcon,
  Person as TeacherIcon
} from '@mui/icons-material';
import axios from 'axios';
import { uploadfile } from '../helper/UploadonCLoud.jsx';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const API = import.meta.env.VITE_BACKEND_URL;

const RegisterForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState({ file: null, url: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    profile_pic: '',
  });

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    setRegistrationData((prev) => ({
      ...prev,
      role: student,
    }));
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsLoading(true);
        const uploadedPhoto = await uploadfile(file);
        setAvatar({ file: file, url: uploadedPhoto.url });
        setRegistrationData((prev) => ({
          ...prev,
          profile_pic: uploadedPhoto.url,
        }));
      } catch (error) {
        setError('Failed to upload profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const URL = `${API}/user/register`;
      const response = await axios.post(URL, registrationData);
      
      if (response.data.success) {
        navigate('/');
        setRegistrationData({
          name: '',
          email: '',
          password: '',
          role: '',
          profile_pic: '',
        });
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
          : 'linear-gradient(135deg, #667eea, #764ba2)',
        p: 2
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 4,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[10]
        }}
      >
        <Typography variant="h4" sx={{ 
          mb: 3,
          fontWeight: 'bold',
          color: theme.palette.primary.main
        }}>
          Create Your Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
          <Avatar
            src={avatar.url}
            sx={{
              width: 100,
              height: 100,
              border: `3px solid ${theme.palette.primary.main}`,
              backgroundColor: theme.palette.action.hover
            }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <label htmlFor="avatar-upload">
            <Input accept="image/*" id="avatar-upload" type="file" onChange={handleAvatar} style={{ display: 'none' }} />
            <IconButton
              component="span"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                }
              }}
            >
              <CameraIcon />
            </IconButton>
          </label>
        </Box>

        <form onSubmit={handleRegistration}>
          <TextField
            required
            label="Full Name"
            name="name"
            value={registrationData.name}
            onChange={handleRegistrationChange}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            required
            label="Email"
            name="email"
            type="email"
            value={registrationData.email}
            onChange={handleRegistrationChange}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            required
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={registrationData.password}
            onChange={handleRegistrationChange}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select Your Role</InputLabel>
            <Select
              value={registrationData.role}
              onChange={handleRoleChange}
              required
              label="Select Your Role"
              startAdornment={
                <InputAdornment position="start">
                  {registrationData.role === 'teacher' ? (
                    <TeacherIcon color="action" sx={{ mr: 1 }} />
                  ) : (
                    <StudentIcon color="action" sx={{ mr: 1 }} />
                  )}
                </InputAdornment>
              }
            >
              <MenuItem value="Students">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StudentIcon fontSize="small" />
                  Student
                </Box>
              </MenuItem>
              <MenuItem value="Teachers">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TeacherIcon fontSize="small" />
                  Teacher
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Already have an account?
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate('/')}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Sign In
        </Button>
      </Paper>
    </Box>
  );
};

export default RegisterForm;