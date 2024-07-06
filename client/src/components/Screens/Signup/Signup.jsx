import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../Login/Login.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Hook to programmatically navigate

  // Handle form submission
  const handleSignup = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError(""); // Reset error message

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Send signup request to the backend
      const response = await axios.post("http://localhost:3000/signup", {
        name: username,
        email,
        password,
      });

      console.log(response.data);
      navigate("/"); // Redirect to login page after successful signup
    } catch (err) {
      // Handle errors
      if (err.response && err.response.status === 409) {
        setError("Try another email, This user already exists");
      } else {
        setError("An error occurred during signup");
      }
      console.error(err);
    }
  };

  return (
    <div className="square">
      <i style={{ "--clr": "#ff7878" }}></i>
      <i style={{ "--clr": "#a9bfff" }}></i>
      <i style={{ "--clr": "#ffa041" }}></i>
      <div className="form-container">
        <h1 className="title">MoodTune</h1>
        <h2>Signup</h2>
        {error && <p className="error">{error}</p>}{" "}
        {/* Display error message */}
        <form onSubmit={handleSignup}>
          <div className="inputBx">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="inputBx">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="inputBx">
            <input type="submit" value="Sign up" />
          </div>
        </form>
        <div className="links">
          <Link to="/forgot-password" className="forgot-password">
            Forgot Password
          </Link>
          <Link to="/" className="login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
