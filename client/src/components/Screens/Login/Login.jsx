import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // helps navigate programmatically

  //For handling form submissions

  const handleLogin = async (event) => {
    event.preventDefault(); //prevent the default submission of my form

    try {
      //Sending a post request to the login endpoint using Axios
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });

      console.log(response.data);
      const { token } = response.data; // Extracting the token from my response

      localStorage.setItem("token", token); //storing my token locally
      navigate("/protected"); // It should redirect me to a protected route if the login was successful
    } catch (error) {
      console.error("Invalid Login credentials");
    }
  };
  return (
    <div className="square">
      <i style={{ "--clr": "#33dce9" }}></i>
      <i style={{ "--clr": "#0443e1" }}></i>
      <i style={{ "--clr": "#d000ff" }}></i>
      <div className="form-container">
        <h1 className="title">MoodTune</h1>
        <h2>Login</h2>
        <div className="inputBx">
          <input
            type="text"
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
          <input type="submit" value="Sign in" onClick={handleLogin} />
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
      </div>
    </div>
  );
};

export default Login;
