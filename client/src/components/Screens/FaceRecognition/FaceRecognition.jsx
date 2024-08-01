import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import "./FaceRecognition.css";
import SideBar from "../../SideBar/SideBar";

const FaceRecognition = ({ theme, toggleTheme }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  const videoWidth = 1080;
  const videoHeight = 720;

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `/models`;

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      ]);

      setIsModelLoaded(true);
    };

    loadModels();
  }, []);

  const startRecognition = async () => {
    try {
      videoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setIsRecognizing(true);
      handleVideoOnPlay();
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  };

  const stopRecognition = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsRecognizing(false);
    }
  };

  const handleVideoOnPlay = () => {
    if (!isModelLoaded) return;

    const id = setInterval(async () => {
      if (
        canvasRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        faceapi.matchDimensions(canvas, {
          width: videoWidth,
          height: videoHeight,
        });

        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, {
          width: videoWidth,
          height: videoHeight,
        });

        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.clearRect(0, 0, videoWidth, videoHeight);

          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceExpressions(
            canvasRef.current,
            resizedDetections
          );

          resizedDetections.forEach((face) => {
            const { age, gender, genderProbability, detection } = face;
            const genderText = `${gender} - ${Math.round(
              genderProbability * 100
            )}%`;
            const ageText = `${Math.round(age)} years`;
            const textField = new faceapi.draw.DrawTextField(
              [genderText, ageText],
              face.detection.box.topRight
            );
            textField.draw(canvasRef.current);

            const drawBox = new faceapi.draw.DrawBox(detection.box, {
              label: `Age: ${ageText}, Gender: ${genderText}`,
            });
            drawBox.draw(canvasRef.current);
          });

          if (resizedDetections.length > 0) {
            const expressions = resizedDetections[0].expressions;
            const prominentExpression = Object.keys(expressions).reduce(
              (a, b) => (expressions[a] > expressions[b] ? a : b)
            );

            setLoading(true);
            await sendRecommendationToBackend(prominentExpression);
            setLoading(false);
            setNotification(
              `Recommendation saved with expression: ${prominentExpression}`
            );
            setTimeout(() => setNotification(""), 3000);
            stopRecognition();
          }
        }
      }
    }, 5000);

    setIntervalId(id);
  };

  const sendRecommendationToBackend = async (expression_value) => {
    const userId = localStorage.getItem("userId");

    const recommendationData = {
      user_id: userId,
      expression_value,
    };

    try {
      await axios.post(
        "http://localhost:3000/save-expression",
        recommendationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Recommendation saved successfully");
    } catch (error) {
      console.error("Failed to save recommendation:", error);
      setNotification("Failed to save recommendation");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  return (
    <div
      className={`face-recognition-container ${
        theme === "dark" ? "dark-theme" : "light-theme"
      }`}
    >
      <SideBar theme={theme} setTheme={toggleTheme} />
      <div className="main-content">
        <div className="controls">
          <button
            onClick={startRecognition}
            className="start-button"
            disabled={!isModelLoaded || isRecognizing}
          >
            {isModelLoaded ? "Start Facial Recognition" : "Loading Models..."}
          </button>
          {isRecognizing && (
            <button onClick={stopRecognition} className="stop-button">
              Stop Recognition
            </button>
          )}
        </div>
        <div className="video-container">
          <video
            ref={videoRef}
            width={videoWidth}
            height={videoHeight}
            playsInline
            autoPlay
            onPlay={handleVideoOnPlay}
            onLoadedData={handleVideoOnPlay}
          />
          <canvas
            ref={canvasRef}
            width={videoWidth}
            height={videoHeight}
            className="canvas"
          />
        </div>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-text">Saving recommendation...</div>
          </div>
        )}
        {notification && <div className="notification">{notification}</div>}
      </div>
    </div>
  );
};

export default FaceRecognition;
