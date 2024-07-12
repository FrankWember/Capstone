import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Screens/Login/Login";
import Signup from "./components/Screens/Signup/Signup";
import Player from "./components/Screens/Player/Player";
import Home from "./components/Home/Home";
import Playlist from "./components/Screens/Playlist/Playlist";
import "./App.css";
import Recommendation from "./components/Screens/Recommendation/Recommendation";
import FaceRecognition from "./components/Screens/FaceRecognition/FaceRecognition";

const ProtectedRoute = ({ children }) => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const [token, setToken] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const extractTokensFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      if (accessToken) {
        localStorage.setItem("spotifyToken", accessToken);
        setToken(accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("spotifyRefreshToken", refreshToken);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    };

    extractTokensFromURL();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      const userToken = localStorage.getItem("userToken");
      const accessToken = localStorage.getItem("spotifyToken");
      const refreshToken = localStorage.getItem("spotifyRefreshToken");
      if (userToken && accessToken && refreshToken) {
        try {
          const response = await fetch(
            `http://localhost:3000/auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          const data = await response.json();
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("spotifyToken", data.access_token);
          }
        } catch (error) {
          console.error("Failed to fetch token:", error);
        }
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const refreshAccessToken = async () => {
      const userToken = localStorage.getItem("userToken");
      const refreshToken = localStorage.getItem("spotifyRefreshToken");
      if (userToken) {
        try {
          const response = await fetch(
            `http://localhost:3000/refresh_token?refresh_token=${refreshToken}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          const data = await response.json();
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("spotifyToken", data.access_token);
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      }
    };

    const interval = setInterval(refreshAccessToken, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="Home">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendation"
            element={
              <ProtectedRoute>
                <Recommendation
                  token={token}
                  userLocation={userLocation}
                  setUserLocation={setUserLocation}
                  weather={weather}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/face_mood"
            element={
              <ProtectedRoute>
                <FaceRecognition token={token} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home/player"
            element={
              <ProtectedRoute>
                <Player token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlist/:playlistId"
            element={
              <ProtectedRoute>
                <Playlist token={token} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
