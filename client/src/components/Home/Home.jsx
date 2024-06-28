import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "boxicons";
import Trending from "../Screens/Trending/Trending";
import Favorite from "../Screens/Favorites/Favorites";
import Player from "../Screens/Player/Player";
import SideBar from "../SideBar/SideBar";
import Library from "../Screens/Library/Library";
import Login from "../Screens/Login/Login";
import Signup from "../Screens/Signup/Signup";
import ProtectedRoute from "./ProtectedRoute"; // Import the ProtectedRoute component
import "./Home.css";

function Home() {
  return (
    <>
      <div>
        <Router>
          <div className="main-body">
            <SideBar />

            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes: Can only be accessed after authentification was succesful */}
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trending"
                element={
                  <ProtectedRoute>
                    <Trending />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorite"
                element={
                  <ProtectedRoute>
                    <Favorite />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/player"
                element={
                  <ProtectedRoute>
                    <Player />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </div>
    </>
  );
}

export default Home;
