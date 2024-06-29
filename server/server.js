// server.js
const express = require("express");
const cors = require("cors");
const { registerUser, loginUser, verifyToken } = require("./auth"); // importing the function from the auth.js
const app = express();

app.use(cors());
app.use(express.json()); // middleware to parse the json payload

// signup Endpoint

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body; // The request body for signup consist of email password and name
  console.log(email);
  try {
    console.log(req.body);
    const user = await registerUser(email, password, name);
    // This functions hashs the password and create a new user in the database
    res.status(201).json(user); // for success
  } catch (error) {
    res.status(400).json({ error: error.message }); // if exist or error
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body; // gets the email and password
  try {
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/protected", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const userId = await verifyToken(token);
    res.json({ userId });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/register");
