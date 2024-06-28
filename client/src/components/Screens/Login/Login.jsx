import React, { useState } from "react";
import "./styles.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    // Handle login logic here
    console.log("Username:", username);
    console.log("Password:", password);
  };

  return (
    <div className="square">
      <i style={{ "--clr": "#33dce9" }}></i>
      <i style={{ "--clr": "#0443e1" }}></i>
      <i style={{ "--clr": "#d000ff" }}></i>
      <div className="login">
        <h1 className="title">MoodTune</h1>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="inputBx">
            <input type="submit" value="Sign in" />
          </div>
        </form>
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
