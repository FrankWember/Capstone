require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Ensure jwt is imported
const { getSpotifyAccessToken, getSpotifyUserData, verifyToken, registerUser, loginUser } = require('./auth'); // Ensure these functions are imported

const app = express();

app.use(cors());
app.use(express.json());

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.get("/login/spotify", (req, res) => {
    const scopes = 'user-read-private user-read-email';
    res.redirect(`${SPOTIFY_AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
});

app.get("/callback", async (req, res) => {
    const code = req.query.code || null;
    try {
        const tokenData = await getSpotifyAccessToken(code); // Get access token from Spotify
        const userData = await getSpotifyUserData(tokenData.access_token); // Get user data from Spotify

        const token = jwt.sign({ spotifyAccessToken: tokenData.access_token }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // Sending my token and user data to the client side
        res.json({ token, userData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const user = await registerUser(email, password, name);
        res.status(201).json(user);
    } catch (error) {
        if (error.message === "User already exists") {
            res.status(409).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { token, user } = await loginUser(email, password);
        res.json({ token, user });
    } catch (error) {
        if (error.message === "Invalid password") {
            res.status(401).json({ error: error.message });
        } else if (error.message === "User not found") {
            res.status(404).json({ error: error.message });
        } else {
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
