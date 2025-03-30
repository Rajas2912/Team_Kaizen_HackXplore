import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const flaskApi = axios.create({
  baseURL: 'http://localhost:5000',
});

const FaceCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.user);
  const studentId = userInfo?._id || 'unknown';

  // Start camera function from your working example
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setIsCameraOn(false);
    }
  };

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture image function from your working example
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image as base64
      const imageData = canvas.toDataURL('image/jpeg');
      setImage(imageData);
      
      // Send to backend
      sendImageToBackend(imageData);
    }
  };

  // Send image to Flask backend
  const sendImageToBackend = async (imageData) => {
    setLoading(true);
    try {
      const response = await flaskApi.post('/api/capture-face', {
        image: imageData,
        studentId: studentId,
        count: captureCount + 1
      });

      if (response.data.success) {
        const newCount = captureCount + 1;
        setCaptureCount(newCount);
        if (newCount >= 50) {
          setIsComplete(true);
        }
      } else {
        throw new Error(response.data.message || 'Failed to save image');
      }
    } catch (err) {
      console.error('Error sending image:', err);
      setError(err.message || 'Failed to save image');
    } finally {
      setLoading(false);
      setImage(null); // Clear captured image after sending
    }
  };

  if (!userInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      p: 3,
      backgroundColor: '#f5f5f5',
      position: 'relative'
    }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ 
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'primary.main'
        }}
      >
        Back
      </Button>

      <Paper sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: '800px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Face Registration
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          {isComplete 
            ? `Successfully captured 50 images for ${studentId}`
            : `Capture ${50 - captureCount} more images (${captureCount}/50)`
          }
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 3 
        }}>
          {/* Video Feed */}
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            height: '480px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #ddd',
            backgroundColor: '#000'
          }}>
            {!isCameraOn ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'white'
              }}>
                <Typography sx={{ mb: 2 }}>Camera is off</Typography>
                <Button 
                  variant="contained" 
                  onClick={startCamera}
                  disabled={loading}
                >
                  Start Camera
                </Button>
              </Box>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
                {image && (
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: '120px',
                    height: '90px',
                    border: '2px solid white',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={image} 
                      alt="Last captured" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Action Buttons */}
          {!isComplete && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isCameraOn ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startCamera}
                  disabled={loading}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Start Camera
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={captureImage}
                  disabled={loading || !isCameraOn}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                      Processing...
                    </>
                  ) : (
                    'Capture Image'
                  )}
                </Button>
              )}
            </Box>
          )}

          {isComplete && (
            <Button 
              variant="contained" 
              color="success" 
              href="/dashboard"
              sx={{ px: 4, py: 1.5 }}
            >
              Continue to Dashboard
            </Button>
          )}
        </Box>
      </Paper>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default FaceCapture;