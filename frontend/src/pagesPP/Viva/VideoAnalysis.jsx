import React from "react";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // Ensure TensorFlow.js is loaded

export default class Detection extends React.Component {
  // Create references for video and canvas
  videoRef = React.createRef();
  canvasRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      count: 0, // Frames without face
      multiFaceAlertShown: false, // Prevent duplicate multi-face alerts
      detectedObjects: {}, // Store counts of detected objects
      tabSwitchCount: 0, // Count of tab switches
    };
  }

  componentDidMount() {
    // Set up webcam input
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: { facingMode: "user", width: 800, height: 400 },
        })
        .then((stream) => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve) => {
            this.videoRef.current.onloadedmetadata = resolve;
          });
        });

      // Load COCO-SSD model
      const modelPromise = cocoSsd.load();

      Promise.all([modelPromise, webCamPromise])
        .then(([cocoModel]) => {
          this.detectFrame(this.videoRef.current, cocoModel);
        })
        .catch((error) => console.error("Error loading model or webcam:", error));
    }

    // Add event listener for tab visibility changes
    document.addEventListener("visibilitychange", this.handleTabSwitch);
  }

  componentWillUnmount() {
    // Clean up event listener
    document.removeEventListener("visibilitychange", this.handleTabSwitch);
  }

  // Handle tab switch detection
  handleTabSwitch = () => {
    if (document.hidden) {
      this.setState(
        (prevState) => ({ tabSwitchCount: prevState.tabSwitchCount + 1 }),
        () => {
          console.log(`Tab switched! Total tab switches: ${this.state.tabSwitchCount}`);
        }
      );
    }
  };

  detectFrame = (video, cocoModel) => {
    cocoModel.detect(video).then((predictions) => {
      if (this.canvasRef.current) {
        this.renderPredictions(predictions);
        requestAnimationFrame(() => this.detectFrame(video, cocoModel));
      }
    });
  };

  renderPredictions = (predictions) => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";

    let faces = 0;
    const objectCounts = {};

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

      // Count objects
      if (!objectCounts[prediction.class]) {
        objectCounts[prediction.class] = 1;
      } else {
        objectCounts[prediction.class]++;
      }

      // Increment face count
      if (prediction.class === "person") faces += 1;
    });

    // Update detected objects state and log to console
    this.setState({ detectedObjects: objectCounts }, () => {
      console.log("Detected Objects:", this.state.detectedObjects);
    });

    // Handle face visibility
    if (predictions.length === 0) {
      this.setState((prevState) => {
        const newCount = prevState.count + 1;
        if (newCount >= 50) {
          // toast.error("Face Not Visible - Action has been Recorded");
          this.props.FaceNotVisible?.();
          return { count: 0 };
        }
        return { count: newCount };
      });
    } else {
      this.setState({ count: 0 });
    }

    // Handle prohibited objects
    let isProhibitedAlertShown = false;
    predictions.forEach((prediction) => {
      if (!isProhibitedAlertShown && ["cell phone", "book", "laptop"].includes(prediction.class)) {
        this.props.ProhibitedObject?.();
        // toast.error("Prohibited Object Detected - Action has been Recorded");
        isProhibitedAlertShown = true;
      }
    });

    // Handle multiple faces
    if (faces > 1 && !this.state.multiFaceAlertShown) {
      this.props.MultipleFacesVisible?.();
      // toast.error(`${faces} people detected - Action has been recorded`);
      this.setState({ multiFaceAlertShown: true });
    } else if (faces <= 1 && this.state.multiFaceAlertShown) {
      this.setState({ multiFaceAlertShown: false });
    }
  };

  render() {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
        {/* Second Card */}
        <div className="bg-white shadow-md border border-blue-400 rounded-md">
          <figure className="w-full h-40 md:h-60 lg:h-80 border border-gray-200 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
            <video
              ref={this.videoRef}
              autoPlay
              muted
              className={`w-full h-full object-cover`}
            />
            <canvas ref={this.canvasRef} className="absolute top-200 left-300" width="350" height="400" />
          </figure>
        </div>
      </div>
    );
  }
}