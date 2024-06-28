import React, { useState } from "react";
import "./Registration.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (event) => {
    event.preventDefault();
    // Handle registration logic here
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
  };

  return (
    <div className="square">
      <i style={{ "--clr": "#33dce9" }}></i>
      <i style={{ "--clr": "#0443e1" }}></i>
      <i style={{ "--clr": "#d000ff" }}></i>
      <div className="login">
        <h1 className="title">MoodTune</h1>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
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
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
