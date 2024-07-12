import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import "./FaceRecognition.css";
import SideBar from "../../SideBar/SideBar";

const FaceRecognition = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);

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

      try {
        videoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    loadModels();
  }, [videoWidth, videoHeight]);

  const handleVideoOnPlay = () => {
    if (!isModelLoaded) return;

    const intervalId = setInterval(async () => {
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

          // Extract the most prominent expression and send it to the backend
          if (resizedDetections.length > 0) {
            const expressions = resizedDetections[0].expressions;
            const prominentExpression = Object.keys(expressions).reduce(
              (a, b) => (expressions[a] > expressions[b] ? a : b)
            );

            // Send the expression to the backend
            sendExpressionToBackend(prominentExpression);
          }
        }
      }
    }, 5000); // Capture expression every 5 seconds

    return () => clearInterval(intervalId);
  };

  const sendExpressionToBackend = async (expression) => {
    const userId = localStorage.getItem("user_id");

    try {
      await axios.post(
        "http://localhost:3000/save-expression",
        { user_id: userId, expression },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Expression saved successfully");
    } catch (error) {
      console.error("Failed to save expression:", error);
    }
  };

  return (
    <div>
      <SideBar />
      <div className="face-recognition-container">
        <div className="video-container">
          <video
            ref={videoRef}
            width={videoWidth}
            height={videoHeight}
            playsInline
            autoPlay
            onPlay={handleVideoOnPlay}
            onLoadedData={handleVideoOnPlay}
            style={{ position: "relative" }}
          />
          <canvas
            ref={canvasRef}
            width={videoWidth}
            height={videoHeight}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;
