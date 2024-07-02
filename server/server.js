require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getSpotifyAccessToken, getSpotifyUserData, registerUser, loginUser, verifyToken } = require('./auth');

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
        const tokenData = await getSpotifyAccessToken(code);
        const userData = await getSpotifyUserData(tokenData.access_token);

        const { email, display_name: name } = userData;
        const user = await registerUser(email, null, name, true);

        const token = jwt.sign({ userId: user.id, spotifyAccessToken: tokenData.access_token }, process.env.SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, user });
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
        } else if (error.message === "Please login with Spotify") {
            res.status(403).json({ error: error.message });
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
