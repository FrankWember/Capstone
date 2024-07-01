import React from "react";
import { Routes, Route } from "react-router-dom"; // for setting up routes in a React application.

import ProtectedRoute from "./ProtectedRoute"; //Only accessible by Authenticated users
import Login from "../Screens/Login/Login";
import Signup from "../Screens/Signup/Signup";
import Trending from "../Screens/Trending/Trending";
import Favorites from "../Screens/Favorites/Favorites";
import Player from "../Screens/Player/Player";
import Library from "../Screens/Library/Library";
import Home from "../Home/Home";

export const RouterConfig = () => {
  return (
    //Defines a collection of routes
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/Home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
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
            <Favorites />
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
  );
};
