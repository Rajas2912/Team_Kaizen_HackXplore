import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper,Link  } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

const API = import.meta.env.VITE_BACKEND_URL;

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const URL = `${API}/user/login`;
      const response = await axios.post(URL, loginData, { withCredentials: true });

      console.log(response.data.message);
      if (response.data.success) {
        console.log("response",response.data);
        localStorage.setItem("token", response?.data?.token);
        setLoginData({ email: "", password: "" });
        navigate("/home");
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
        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: 350,
          textAlign: "center",
          borderRadius: "10px",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h5" sx={{ color: "#1e3c72", mb: 2 }}>
          Welcome Back
        </Typography>
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
            sx={{ mb: 2 }}
          />
          <TextField
            required
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            value={loginData.password}
            onChange={handleLoginChange}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: "#1e3c72", color: "white" }}>
            Log In
          </Button>
        </form>
        <Typography sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link href="/register" sx={{ color: "#1e3c72", fontWeight: "bold" }}>
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginForm;
