import React, { useState } from "react";
// import { toast } from "react-toastify";
import { TextField, Button, Box, Typography, Paper, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import avatar_png from "../../public/image.png";
import axios from "axios";
import { uploadfile } from "../helper/UploadonCLoud.jsx";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_URL;

const RegisterForm = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    profile_pic: "",
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
      role: e.target.value,
    }));
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadedPhoto = await uploadfile(file);
      setAvatar({ file: file, url: uploadedPhoto.url });
      setRegistrationData((prev) => ({
        ...prev,
        profile_pic: uploadedPhoto.url,
      }));
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const URL = `${API}/user/register`;
      const response = await axios.post(URL, registrationData);

      console.log(response.data?.message);
      navigate("/");
      if (response.data.success) {
        setRegistrationData({ name: "", email: "", password: "", role: "", profile_pic: "" });
      }
    } catch (error) {
        console.log(error?.response?.data?.message);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #4b6cb7, #182848)",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          width: 400,
          textAlign: "center",
          borderRadius: "10px",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h5" sx={{ color: "#4b6cb7", mb: 2 }}>
          Create an Account
        </Typography>
        <form onSubmit={handleRegistration}>
          <label htmlFor="file" style={{ display: "block", cursor: "pointer" }}>
            <img
              src={avatar.url || avatar_png}
              alt="Avatar"
              style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "10px" }}
            />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />

          <TextField
            required
            label="Username"
            name="name"
            value={registrationData.name}
            onChange={handleRegistrationChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            required
            label="Email"
            name="email"
            type="email"
            value={registrationData.email}
            onChange={handleRegistrationChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            required
            label="Password"
            name="password"
            type="password"
            value={registrationData.password}
            onChange={handleRegistrationChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Role</InputLabel>
            <Select value={registrationData.role} onChange={handleRoleChange} required>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: "#4b6cb7", color: "white" }}>
            Sign Up
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterForm;
