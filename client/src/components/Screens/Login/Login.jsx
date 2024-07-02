import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "../../SideBar/SideBar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to handle displaying error messages
  const [loading, setLoading] = useState(false); // State to handle button loading status

  const navigate = useNavigate(); // helps navigate programmatically

  // For handling form submissions
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent the default submission of my form
    setLoading(true);
    setError(""); // Reset error messages on new submission
    try {
      // Sending a post request to the login endpoint using Axios
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });

      console.log(response.data);
      const { token } = response.data; // Extracting the token from my response

      localStorage.setItem("token", token); // Storing my token locally
      navigate("/Home"); // It should redirect me to a protected route if the login was successful
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error.response.status === 401) {
        setError("Invalid login credentials"); // Handle login errors
      } else if (error.response.status === 404) {
        setError("User not found create a new account");
      } else {
        setError("Server is under maintenance");
      }
      console.error(error.response.status);
    }
  };
  return (
    <>
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
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              placeholder="Password"
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
            <a href="#" className="signup">
              <Link to="/signup" className="signup">
                Register
              </Link>
            </a>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
