import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
} from "@mui/material";
import { VideoCall, Shuffle, Person, Group } from "@mui/icons-material";

function VideoMeeting() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  // Generate a random room ID
  const handleRoomIdGenerate = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString().substring(-4);
    setRoomId(randomId + timestamp);
  };

  const handleOneAndOneCall = () => {
    if (!roomId) {
      alert('Please Generate Room ID First');
      return;
    }
    navigate(`/room/${roomId}?type=one-on-one`);
  };

  const handleGroupCall = () => {
    if (!roomId) {
      alert('Please Generate Room ID First');
      return;
    }
    navigate(`/room/${roomId}?type=group-call`);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
        Welcome to Video Calling App
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
        Start a video call with a randomly generated Room ID
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 400 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Generated Room ID"
            value={roomId}
            InputProps={{
              readOnly: true,
            }}
            sx={{
              backgroundColor: "background.paper",
              borderRadius: 1,
            }}
          />
          <Button
            variant="contained"
            startIcon={<Shuffle />}
            onClick={handleRoomIdGenerate}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              backgroundColor: "#3f51b5",
              "&:hover": {
                backgroundColor: "#303f9f",
              },
            }}
          >
            Generate Room ID
          </Button>
          <Button
            variant="contained"
            startIcon={<Person />}
            onClick={handleOneAndOneCall}
            disabled={!roomId}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
              "&:disabled": {
                backgroundColor: "#bdbdbd",
              },
            }}
          >
            One-on-One Call
          </Button>
          <Button
            variant="contained"
            startIcon={<Group />}
            onClick={handleGroupCall}
            disabled={!roomId}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              backgroundColor: "#ff9800",
              "&:hover": {
                backgroundColor: "#f57c00",
              },
              "&:disabled": {
                backgroundColor: "#bdbdbd",
              },
            }}
          >
            Group Call
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default VideoMeeting;