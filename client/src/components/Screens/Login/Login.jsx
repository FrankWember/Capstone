import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState(""); // State to store email input
  const [password, setPassword] = useState(""); // State to store password input
  const [error, setError] = useState(""); // State to handle error messages
  const [loading, setLoading] = useState(false); // State to handle loading status

  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent form submission

    setLoading(true); // Setting loading state to true
    setError(""); // Resetting the error state

    try {
      // Send login request to backend
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });

      const { userToken } = response.data; // Extract user token from response
      console.log("Token received:", userToken);

      localStorage.setItem("userToken", userToken); // Store token in local storage
      console.log(
        "Token stored in localStorage:",
        localStorage.getItem("userToken")
      );
      navigate("/home"); // Navigate to home page after successful login
    } catch (error) {
      setLoading(false); // Set loading state to false
      console.log("Login error:", error);
      localStorage.setItem("Login error", error);
      console.log(localStorage.getItem("Login error"));
      if (error.response?.status === 401) {
        setError("Invalid login credentials"); // Setting error message for invalid credentials
      } else if (error.response?.status === 404) {
        setError("User not found. Create a new account"); // Setting error message for user not found
      } else {
        setError("Server is under maintenance"); // Setting error message for server issues
      }
    }
    window.location.href = "http://localhost:3000/auth/login"; // Redirect to Spotify login
  };

  return (
    <>
      <div className="bodyContainer">
        <div className="square">
          <i style={{ "--clr": "#ff7878" }}></i>
          <i style={{ "--clr": "#a9bfff" }}></i>
          <i style={{ "--clr": "#ffa041" }}></i>

          <form className="form-container" onSubmit={handleLogin}>
            <h1 className="title">MoodTune</h1>
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}{" "}
            {/* Display error messages */}
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
              <input type="submit" value="Sign in" disabled={loading} />
            </div>
            <div className="links">
              <a href="#" className="forgot-password">
                Forget Password
              </a>
              <Link to="/signup" className="signup">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
