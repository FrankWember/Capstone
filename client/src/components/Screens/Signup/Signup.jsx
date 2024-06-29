import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import "./Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (event) => {
    event.preventDefault();
    // Handle Signup logic here
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    const response = axios
      .post("http://localhost:3000/signup", {
        name: username,
        email,
        password,
      })
      .catch((err) => {
        if (err.message === "Existing user") {
          alert("This is an existing User");
        } else {
          console.error(Error);
        }
      });
  };

  return (
    <div className="square">
      <i style={{ "--clr": "#33dce9" }}></i>
      <i style={{ "--clr": "#0443e1" }}></i>
      <i style={{ "--clr": "#d000ff" }}></i>
      <div className="form-container">
        <h1 className="title">MoodTune</h1>
        <h2>Signup</h2>
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
          <a href="#" className="forgot-password">
            Forgot Password
          </a>
          <a href="#" className="signup">
            <Link to="/login" className="signup">
              Login
            </Link>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
