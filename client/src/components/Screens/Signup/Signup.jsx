import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../Login/Login.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // State to store error messages
  const navigate = useNavigate(); // For redirecting after successful signup

  const handleSignup = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/signup", {
        name: username,
        email,
        password,
      });
      console.log(response.data);
      navigate("/"); // Redirect user to login after successful signup
    } catch (err) {
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
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="inputBx">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="inputBx">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
