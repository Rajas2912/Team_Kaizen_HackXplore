import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Video_analysis from "./VideoAnalysis.jsx";
import {
  Button,
  Skeleton,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import CallEndIcon from "@mui/icons-material/CallEnd";
import axios from "axios";
import AlertAgreeDisagree from "./AlerttAgreeDisagree.jsx";
import { useSelector } from "react-redux";

const API = import.meta.env.VITE_BACKEND_URL;

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questionload, setQuestionload] = useState(false);
  const { username, interviewId, vivadata } = location.state || {};
  const [questionSet, setQuestionSet] = useState([]); // All questions from API
  const [remainingQuestions, setRemainingQuestions] = useState([]); // Questions left to ask
  const [micOn, setMicOn] = useState(false);
  const [qHistory, setQHistory] = useState([]); // Store Gemini API responses
  const [c_answer, setCurrentAnswer] = useState("");
  const [c_question, setCurrentQuestion] = useState("");
  const [timer, setTimer] = useState(0);
  const [timeofthinking, setTimeOfThinking] = useState(0);
  const [started, setStarted] = useState(false);
  const [loadendViva, setLoadendViva] = useState(false);
  const [endVideo, setEndVideo] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isVivaEnded, setIsVivaEnded] = useState(false);
  const [reportReady, setReportReady] = useState(false); // New state to track report readiness
  const [report, setReport] = useState(null);

  const { vivaId } = useParams();
  const { userInfo } = useSelector((state) => state.user); // Access user role from Redux

  // Audio recording state and refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Speech synthesis function with audio recording
  const speakText = (text, rate = 0.95) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = rate;

    utterance.onend = () => {
      setTimer(timeofthinking*60);
      setMicOn(true);
      startAudioRecording();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setMicOn(false);
    };

    try {
      synth.speak(utterance);
    } catch (error) {
      console.error("Failed to start speech synthesis:", error);
      setMicOn(false);
    }
  };

  // Start audio recording
  const startAudioRecording = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported in your browser");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const options = { mimeType: "audio/webm" };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
        toast.error("Could not access microphone");
      });
  };

  // Stop recording and process audio
  const stopAudioRecording = async () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.onstop = () => {
          try {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });

            // Create a File object from the Blob
            const file = new File([audioBlob], `recording_${Date.now()}.wav`, {
              type: "audio/wav",
            });

            resolve(file);
            audioChunksRef.current = [];
          } catch (error) {
            console.error("Error processing audio:", error);
            toast.error("Error processing audio recording");
            resolve(null);
          }

          // Stop and clean up the audio stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        };

        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  };

  // Fetch question set from API
  const fetchQuestionSet = async () => {
    try {
      const response = await axios.get(`${API}/viva/getOneViva/${vivaId}`);
      setQuestionSet(response.data.questionAnswerSet);
      setRemainingQuestions(response.data.questionAnswerSet); // Initialize remaining questions
      setTimeOfThinking(response.data.timeofthinking);
    } catch (error) {
      console.error("Error Fetching viva:", error);
    }
  };

  useEffect(() => {
    fetchQuestionSet();
  }, []);

  // Start the viva session
  const startViva = async () => {
    selectNextQuestion();
  };

  // Select a random question from remaining questions
  const selectNextQuestion = () => {
    if (isVivaEnded) {
      return; // Do not fetch new questions if the viva has ended
    }

    if (remainingQuestions.length === 0) {
      handleAgree();
      return;
    }

    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const selectedQuestion = remainingQuestions[randomIndex];
    setCurrentQuestion(selectedQuestion.questionText);
    speakText(selectedQuestion.questionText); // Speak the question
    setCurrentAnswer(selectedQuestion.answer);
    setStarted(true);
    setRemainingQuestions((prev) =>
      prev.filter((q) => q._id !== selectedQuestion._id)
    ); // Remove the selected question
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (isVivaEnded) {
      return; // Do not process further if the viva has ended
    }
    setTimer(0);
    setLoading(true);
    setQuestionload(true);
    setMicOn(false);

    // Stop audio recording and get the audio file
    const audioFile = await stopAudioRecording();

    // Create a FormData object
    const formData = new FormData();
    formData.append("question", c_question);
    formData.append("modelAnswer", c_answer);
    formData.append("audio", audioFile); // Append the audio file

    try {
      const response = await axios.post(`${API}/viva/send-to-gemini`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Set the correct content type
        },
      });

      console.log(response?.data?.evaluation);
      // Store Gemini API response
      setQHistory((prev) => [
        ...prev,
        {
          questionText: c_question,
          modelAnswer: c_answer,
          studentAnswer: response?.data?.transcript,
          evaluation: response?.data?.evaluation,
        },
      ]);
    } catch (error) {
      console.error("Error sending data to Gemini API:", error);
    } finally {
      setLoading(false);
      if (!isVivaEnded) {
        selectNextQuestion(); // Move to the next question only if the viva hasn't ended
      }
      setQuestionload(false);
    }
  };

  // End the viva session
  const endViva = async () => {
    setOpenDialog(true);
  };

  // Handle user agreeing to end the viva
  const handleAgree = async () => {
    setEndVideo(true);
    setOpenDialog(false);
    setLoadendViva(true);
    speechSynthesis.cancel();
    setCurrentQuestion("Successfully completed Viva!");
    setIsVivaEnded(true); // Mark the viva as ended

    // // Save viva results to the database
    // try {
    //   const response = await axios.post(`${API}/vivaresult/addvivaresult`, {
    //     vivaId,
    //     studentId: userInfo?._id,
    //     studentName: userInfo?.name,
    //     totalQuestions: questionSet?.length,
    //     questionAnswerSet:qHistory, // All Gemini API responses
    //     dateOfViva: Date.now(),
    //     proctoredFeedback: report?.allDetectedObjects,
    //   });

    //   if (response.status === 200) {
    //     navigate("/viva-end", { state: { qHistory } }); // Pass qHistory to the end screen
    //   } else {
    //     console.error("Failed to save viva results:", response.data);
    //   }
    // } catch (error) {
    //   console.error("Error saving viva results:", error);
    // }
  };

    // Effect to save results once the report is ready
    useEffect(() => {
      if (reportReady && report) {
        const saveResults = async () => {
          try {
            const response = await axios.post(`${API}/vivaresult/addvivaresult`, {
              vivaId,
              studentId: userInfo?._id,
              studentName: userInfo?.name,
              totalQuestions: questionSet?.length,
              questionAnswerSet: qHistory, // All Gemini API responses
              dateOfViva: Date.now(),
              proctoredFeedback: report?.allDetectedObjects,
            });
  
            if (response.status === 200) {
              navigate("/viva-end", { state: { qHistory } }); // Pass qHistory to the end screen
            } else {
              console.error("Failed to save viva results:", response.data);
            }
          } catch (error) {
            console.error("Error saving viva results:", error);
          }
        };
  
        saveResults();
      }
    }, [reportReady, report, qHistory, userInfo, vivaId, questionSet, navigate]);
  
  // Handle user disagreeing to end the viva
  const handleDisagree = () => {
    setOpenDialog(false);
  };

  // Timer effect
  useEffect(() => {
    if (timer > 1) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else if (timer === 1 && started) {
      handleNextQuestion(); // Automatically move to the next question when time is up
    }
  }, [timer, started]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: 2,
      }}
    >
      <Paper
        sx={{
          backgroundColor: "primary.light",
          borderRadius: 2,
          padding: 2,
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", padding: 1 }}>
          {started && (
            <Button
              variant="contained"
              color="error"
              endIcon={<CallEndIcon />}
              onClick={endViva}
              sx={{ fontSize: "12px", padding: "7px 7px" }}
            >
              End Viva
            </Button>
          )}
        </Box>
        <AlertAgreeDisagree
          open={openDialog}
          title="End Viva Confirmation"
          description="Are you sure you want to end the Viva? This action cannot be undone."
          confirmText="Yes, End Viva"
          cancelText="No, Continue"
          onConfirm={handleAgree}
          onCancel={handleDisagree}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "45% 55%", md: "35% 65%" },
            gap: 2,
          }}
        >
          {/* Video Column */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Video_analysis
              endVideo={endVideo}
              onAnalysisComplete={(report) => {
                setReport(report);
                setReportReady(true); // Set report as ready
              }}/>
          </Box>
          {/* Content Column */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "white",
              borderRadius: 2,
              padding: 2,
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            {/* Question Display */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Question Displayed here:
              </Typography>
              <Box
                sx={{
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                  padding: 1,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {questionload ? (
                  <Box>
                    <Skeleton animation="wave" height={22} variant="text" />
                    <Skeleton animation="wave" height={22} width="90%" />
                    <Skeleton animation="wave" height={22} width="80%" />
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ color: "black" }}>
                    {c_question || "Click on start button to start viva"}
                  </Typography>
                )}
              </Box>
            </Box>
            {/* Buttons and Timer */}
            {!loadendViva && (
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {!started ? (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={startViva}
                      >
                        Start Viva
                      </Button>
                    ) : (
                      micOn && (
                        <Button
                          onClick={handleNextQuestion}
                          endIcon={<MicIcon />}
                          variant="contained"
                          color={micOn ? "secondary" : "primary"}
                          sx={{ fontSize: "12px", padding: "7px 7px" }}
                        >
                          Next Question
                        </Button>
                      )
                    )}
                  </Box>
                  {/* Timer */}
                  {started && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          backgroundColor: "grey.800",
                          color: "white",
                          borderRadius: 1,
                          padding: 1,
                        }}
                      >
                        <Typography variant="h6">
                          {Math.floor(timer / 60)
                            .toString()
                            .padStart(2, "0")}
                        </Typography>
                        <Typography variant="caption">min</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          backgroundColor: "grey.800",
                          color: "white",
                          borderRadius: 1,
                          padding: 1,
                        }}
                      >
                        <Typography variant="h6">
                          {(timer % 60).toString().padStart(2, "0")}
                        </Typography>
                        <Typography variant="caption">sec</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Interview;