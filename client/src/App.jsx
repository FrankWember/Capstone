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

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("spotifyToken");
  if (!token) {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("spotifyToken") || ""
  );
  const refreshToken = localStorage.getItem("spotifyRefreshToken");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const refresh_token = urlParams.get("refresh_token");
    if (token) {
      localStorage.setItem("spotifyToken", token);
      setToken(token);
      if (refresh_token) {
        localStorage.setItem("spotifyRefreshToken", refresh_token);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshToken) {
        try {
          const response = await fetch(
            `/auth/refresh_token?refresh_token=${refreshToken}`
          );
          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem("spotifyToken", data.access_token);
            setToken(data.access_token);
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      }
    }, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken]);

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
