// server.js
require("dotenv").config(); // this is necessay to import the env and add security
const express = require("express"); 
const cors = require("cors"); 
// it is used to control how web applications from
// different origins can access resources from a server.

const { getSpotifyAccessToken, getSpotifyUserData, registerUser, loginUser, verifyToken } = require('./auth'); // Ensure all required functions are imported
 // importing the function from the auth.js
const app = express(); // create an express instance

app.use(cors()); // make our instance be able to use CORS
app.use(express.json()); // middleware to parse the json payload
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;



// signup Endpoint
app.get("/spotify/playlists", async (req, res) => {
  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/spotify/playlist/:id/tracks", async (req, res) => {
  const { id } = req.params;
  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
  
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body; // The request body for signup consist of email password and name

  try {
    console.log(req.body);
    const user = await registerUser(email, password, name);
    // This functions hashs the password using bycrpt and create a new user in the database
    res.status(201).json(user); // for success
  } catch (error) {
    // if exist or error
    if (error.message === "User already exists") {
      res.status(409).json({ error: error.message }); //Error code for a conflit
    } else {
      res.status(400).json({ error: error.message }); 
    }
  }
});

app.post("/login", async (req, res) => { // This is to read
  const { email, password } = req.body; // gets the email and password from the request body

  try {
    const { token, user } = await loginUser(email, password);  // will pass it as parameter to auth
    console.log(user);
    res.json({ token, user }); // returns a responds which contains both the user and token
  } catch (error) {
    
    if (error.message === "Invalid password") {
      res.status(401).json({ error: error.message });
    } else if (error.message === "User not found") {
      res.status(404).json({ error: error.message }); 
    } else{
    res.status(400).json({ error: error.message });
    }
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
