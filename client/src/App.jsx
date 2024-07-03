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
  const token = localStorage.getItem("spotifyToken"); // We grab the JWT token from the local storage

  if (!token) {
    return <Navigate to="/" />; // redirects to login page if the credential are wrong
  }
  return children; // Returns the child component if it finds the right credential
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
      setToken(token); // Set the token in state
      if (refresh_token) {
        localStorage.setItem("spotifyRefreshToken", refresh_token);
      }
      console.log(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshToken) {
        const response = await fetch(
          `/auth/refresh_token?refresh_token=${refreshToken}`
        );
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem("spotifyToken", data.access_token);
          setToken(data.access_token);
        }
      }
    }, 55 * 60 * 1000); // Refresh token every 55 minutes

    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <Router>
      {/* The flex-grow-1 class makes the element grow to fill 
      any available space in its flex container.
      The p-3 class applies padding to all sides of the element.
      make the element both flexible and padded: */}
      <div className="Home">
        {/* Defines a collection of routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/Home"
            element={
              <ProtectedRoute>
                <Home token={token} /> {/* Pass the token as a prop */}
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
