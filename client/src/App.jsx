import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Screens/Login/Login";
import Signup from "./components/Screens/Signup/Signup";
import Trending from "./components/Screens/Trending/Trending";
import Favorites from "./components/Screens/Favorites/Favorites";
import Player from "./components/Screens/Player/Player";
import Library from "./components/Screens/Library/Library";
import Home from "./components/Home/Home";
import "./App.css";

// ProtectedRoute Component to restrict access to certain routes
const ProtectedRoute = ({ children }) => {
  const userToken = localStorage.getItem("userToken"); // Get user token from local storage
  if (!userToken) {
    return <Navigate to="/" />; // Redirect to login if not authenticated
  }

  return children; // Render the protected component
};

const App = () => {
  const [token, setToken] = useState(""); // State to store Spotify token

  useEffect(() => {
    // Function to extract tokens from URL parameters
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

      // Remove tokens from URL after storing them
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    // Call the function to extract tokens from URL
    extractTokensFromURL();
  }, []);

  useEffect(() => {
    // Function to fetch the token from the backend
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
    // Function to refresh the token periodically
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
          console.log(data);
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("spotifyToken", data.access_token);
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      }
    };

    const interval = setInterval(refreshAccessToken, 55 * 60 * 1000); // Refresh token every 55 minutes
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
            path="/library"
            element={
              <ProtectedRoute>
                <Library token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Trending token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorite"
            element={
              <ProtectedRoute>
                <Favorites token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <Player token={token} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
