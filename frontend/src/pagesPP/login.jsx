import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Link, 
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';

import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { setCredentials } from '../redux/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';

const API = import.meta.env.VITE_BACKEND_URL;

const LoginForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const URL = `${API}/user/login`;
      const response = await axios.post(URL, loginData, {
        withCredentials: true,
      });

      if (response.data.success) {
        localStorage.setItem('token', response?.data?.token);
        dispatch(setCredentials(response.data.data));
        setLoginData({ email: '', password: '' });
        navigate('/main');
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Login failed. Please try again.');
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
          ? 'linear-gradient(135deg, #121212, #1e1e1e)' 
          : 'linear-gradient(135deg, #f5f7fa, #e4e8f0)',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 450,
          textAlign: 'center',
          borderRadius: 4,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[10]
        }}
      >
        <Box sx={{ mb: 3 }}>
          <AccountIcon sx={{ 
            fontSize: 60, 
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover,
            borderRadius: '50%',
            p: 1
          }} />
          <Typography variant="h4" sx={{ 
            mt: 2,
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ 
            mt: 1,
            color: theme.palette.text.secondary
          }}>
            Please enter your credentials to login
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            required
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            value={loginData.email}
            onChange={handleLoginChange}
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
            variant="outlined"
            value={loginData.password}
            onChange={handleLoginChange}
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
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
              'Log In'
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Link 
            href="/forgot-password" 
            sx={{ 
              color: theme.palette.text.secondary,
              textDecoration: 'none',
              '&:hover': {
                color: theme.palette.primary.main,
                textDecoration: 'underline'
              }
            }}
          >
            Forgot password?
          </Link>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            OR
          </Typography>
        </Divider>

        <Typography sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link
            href={redirect ? `/register?redirect=${redirect}` : '/register'}
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginForm;