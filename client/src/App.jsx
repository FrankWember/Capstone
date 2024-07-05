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
import SpotifyCard from "./components/Home/Media/SpotifyCard";
import axios from "axios";

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" />;
  }
  return children;
};

const App = () => {
  const [token, setToken] = useState("");
  coonst[(refreshToken, setRefreshToken)] = useState("");

  const fetchAccessTokens = async () => {
    try {
      const response = await axios.get("localhost:3000/auth/token");
      return response.data.access_token;
    } catch (error) {
      console.error("Error fetching the access token", error);
    }
  };

  useEffect(() => {
    const initializeToken = async () => {
      const token = await fetchAccessToken();
      if (token) {
        setToken(token);
        setRefreshToken(token.refreshToken);
      }
    };
    initializeToken();
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
