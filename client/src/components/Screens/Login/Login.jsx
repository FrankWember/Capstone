import React from "react";
import "./Login.css";
import designerImage from "./images/Designer.png";

const Login = () => {
  return (
    <div className="square">
      <i style={{ "--clr": "#33dce9" }}></i>
      <i style={{ "--clr": "#0443e1" }}></i>
      <i style={{ "--clr": "#d000ff" }}></i>
      <div className="form-container">
        <h1 className="title">MoodTune</h1>
        <h2>Login</h2>
        <div className="inputBx">
          <input type="text" placeholder="Username" />
        </div>
        <div className="inputBx">
          <input type="password" placeholder="Password" />
        </div>
        <div className="inputBx">
          <input type="submit" value="Sign in" />
        </div>
        <div className="links">
          <a href="#" className="forgot-password">
            Forget Password
          </a>
          <a href="#" className="signup">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
