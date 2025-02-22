import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back icon
import './TakePicture.css'; // Import the CSS file
import { useSelector } from "react-redux";
const URL = import.meta.env.VITE_FLASK_URL;

const TakePicture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCameraStart, setIsCameraStart] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user); // Access user role from Redux
console.log(userInfo._id)
  const {vivaId}=useParams();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };
  // Start the camera
  const startCamera = async () => {
    try {
      setIsCameraStart(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing the camera: ', err);
    }
  };

  // Convert Base64 to Blob and then to File
  const base64ToFile = (base64String, filename) => {
    const byteString = atob(base64String.split(',')[1]);
    const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: mimeString });
    return new File([blob], filename, { type: mimeString });
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/jpeg');
      setImage(dataURL);

      // Convert Base64 to File and store it
      const file = base64ToFile(dataURL, 'captured_image.jpg');
      setImageFile(file);
    }
  };

  // Process Image by sending as a File instead of Base64 URL
  const processImage = async () => {
    const stdid = '67b4e81b9decbdf7991bc76f'
    if (!imageFile) {
      alert("No image captured.");
      return;
    }
  
    setLoading(true); // Show loading spinner
  
    try {
      const formData = new FormData();
      // console.log(imageFile)

      console.log(userInfo._id)
      formData.append('image', imageFile);
      formData.append('student_id', stdid); // Pass student ID
      console.log(formData)
      console.log('Sending formData:', formData);
  
      const response = await axios.post(`${URL}/recognize_face`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Response:', response);
  
      if (response.status === 200) {
        alert('User Authenticated');
        navigate(`/give-viva/${vivaId}`);
      } else {
        alert('Failed to authenticate');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image');
    } finally {
      setLoading(false); // Hide loading spinner
    }
    // if (imageFile) {
    //   setLoading(true); // Show loading spinner
    //   try {
    //     const formData = new FormData();
    //     formData.append('vivaImg', imageFile);
    //     formData.append('username', 'user'); // Replace with actual user data

    //     console.log('Sending formData:', formData);

    //     const response = await axios.post(`${URL}/candidate/verifyface`, formData, {
    //       headers: { 'Content-Type': 'multipart/form-data' },
    //     });

    //     console.log('Response:', response);

    //     if (response.status === 200) {
    //       alert('User Authenticated');
    //       navigate('/give-viva');
    //     } else {
    //       alert('Failed to authenticate');
    //     }
    //   } catch (error) {
    //     console.error('Error processing image:', error);
    //     alert('Error processing image');
    //   } finally {
    //     setLoading(false); // Hide loading spinner
    //   }
    // }
  };

  return (
    <div className="take-picture-container">
       {/* Back Button in the top-left corner */}
       <button onClick={handleBack} className="back-button">
        <ArrowBackIcon /> Back
      </button>
      <div className="content-box">
        <h1 className="heading">Face Recognition</h1>
        <h1 className="subheading">Follow the instructions</h1>
        <div className="flex flex-col items-center">
          <div className="video-container">
            <video ref={videoRef} autoPlay className="video" />
          </div>
          <div className="button-container">
            {isCameraStart ? (
              <button
                onClick={startCamera}
                className="button start-camera-button"
                disabled={loading}
              >
                Start Camera
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={captureImage}
                  className="button capture-image-button"
                  disabled={loading}
                >
                  Capture Image
                </button>
                {image && (
                  <button
                    onClick={processImage}
                    className="button process-image-button"
                    disabled={loading}
                  >
                    Process Image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {image && (
          <div className="captured-image-container">
            <h2 className="captured-image-heading">Captured Image</h2>
            <img src={image} alt="Captured" className="captured-image" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden-canvas" />
      </div>

      {/* Backdrop for Loading */}
      <Backdrop
        className="backdrop"
        open={loading}
      >
        <CircularProgress className="loading-spinner" />
      </Backdrop>
    </div>
  );
};

export default TakePicture;