// This will help check the present of the JWT token in the 'local storage'
// It will also redirects to the login page if the token is not found
//Renders the protected component if the page is found

import React from "react";
import { Navigate } from "react-route-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />; // redirectes to login page if the credential are wrong
  }
  return children; // Returns the child component if it find the right credential
};

export default ProtectedRoute;
