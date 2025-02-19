import React, { useState, useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // Ensure TensorFlow.js is loaded
import swal from "sweetalert";

const VideoAnalysis = ({ endVideo, onAnalysisComplete, FaceNotVisible, ProhibitedObject, MultipleFacesVisible }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cellPhoneCount, setCellPhoneCount] = useState(0); // Count of cell phones
  const [bookCount, setBookCount] = useState(0); // Count of books
  const [laptopCount, setLaptopCount] = useState(0); // Count of laptops
  const [personCount, setPersonCount] = useState(0); // Count of persons
  const [count, setCount] = useState(0); // Frames without face
  const [multiFaceAlertShown, setMultiFaceAlertShown] = useState(false); // Track multi-face detection
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // Track tab switches

  // Load COCO-SSD model and start video analysis
  useEffect(() => {
    const setupWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: "user", width: 800, height: 400 },
          });
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = resolve;
          });

          const cocoModel = await cocoSsd.load();
          detectFrame(videoRef.current, cocoModel);
        } catch (error) {
          console.error("Error loading model or webcam:", error);
        }
      }
    };

    setupWebcam();
    // Cleanup
    return () => {
      stopVideo(); // Stop the video stream when the component unmounts
    };
  }, []);

  // Handle tab switch detection
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prevCount) => prevCount + 1);
      }
    };

    document.addEventListener("visibilitychange", handleTabSwitch);
    return () => document.removeEventListener("visibilitychange", handleTabSwitch);
  }, []);

  // Detect objects in the video frame
  const detectFrame = (video, model) => {
    model.detect(video).then((predictions) => {
      if (canvasRef.current) {
        renderPredictions(predictions);
        requestAnimationFrame(() => detectFrame(video, model));
      }
    });
  };

  // Render predictions on the canvas
  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";

    let faces = 0;

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // Draw bounding box
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label background and text
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt("16px sans-serif", 10);
      ctx.fillRect(x, y, textWidth + 8, textHeight + 8);

      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);

      // React to specific objects
      switch (prediction.class) {
        case "cell phone":
          swal("Cell Phone Detected", "Action has been Recorded", "error").then(() => {
            setCellPhoneCount((prevCount) => prevCount + 1);
            ProhibitedObject?.();
          });
          break;
        case "book":
          swal("Book Detected", "Action has been Recorded", "error").then(() => {
            setBookCount((prevCount) => prevCount + 1);
            ProhibitedObject?.();
          });
          break;
        case "laptop":
          swal("Laptop Detected", "Action has been Recorded", "error").then(() => {
            setLaptopCount((prevCount) => prevCount + 1);
            ProhibitedObject?.();
          });
          break;
        case "person":
          setPersonCount((prevCount) => prevCount + 1);
          faces += 1;
          break;
        default:
          break;
      }
    });

    // Handle face visibility
    if (predictions.length === 0 && count < 50) {
      setCount((prevCount) => prevCount + 1);
    } else if (predictions.length === 0) {
      setCount(0);
      swal("Face Not Visible", "Action has been Recorded", "error");
      FaceNotVisible?.();
    } else {
      setCount(0);
    }

    // Handle multiple faces
    if (faces > 1 && !multiFaceAlertShown) {
      setMultiFaceAlertShown(true);
      swal(`${faces} people detected`, "Action has been recorded", "error");
      MultipleFacesVisible?.();
    } else if (faces <= 1 && multiFaceAlertShown) {
      setMultiFaceAlertShown(false);
    }
  };

  // Stop the video stream
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log("Stopping video stream...");
      videoRef.current.srcObject.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop(); // Stop each track
      });
      videoRef.current.srcObject = null; // Clear the srcObject
      console.log("Video stream stopped.");
    } else {
      console.log("Video stream is already stopped or not initialized.");
    }
  };

  // Stop video and generate analysis report
  useEffect(() => {
    if (endVideo) {
      console.log("End video prop received. Stopping video and generating report...");
      stopVideo();
      generateAnalysisReport();
    }
  }, [endVideo]);

  // Generate the analysis report
  const generateAnalysisReport = () => {


    const allDetectedObjects = {
      "phoneDetectedCount": cellPhoneCount,
      "laptopDetectedCount": laptopCount,
      "bookDetectedCount": bookCount,
      "multipleUsersDetectedCount": multiFaceAlertShown ? 1:0,
      "tabSwitchingDetectedCount":tabSwitchCount
    };

    const report = {
      allDetectedObjects, // Include all detected objects in the report
    };

    console.log("Analysis Report Generated:", report);
    onAnalysisComplete(report); // Send the report back to the parent component
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
      {/* Second Card */}
      <div className="bg-white shadow-md border border-blue-400 rounded-md">
        <figure className="w-full h-40 md:h-60 lg:h-80 border border-gray-200 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
          <video
            ref={videoRef}
            autoPlay
            muted
            className={`w-full h-full object-cover`}
          />
          <canvas ref={canvasRef} className="absolute top-200 left-300" width="350" height="400" />
        </figure>
      </div>
    </div>
  );
};

export default VideoAnalysis;