require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require('request');
const querystring = require('querystring');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SECRET_KEY = process.env.SECRET_KEY;

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const userToken = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    await prisma.session.create({ data: { userId: user.id, token } });

    res.json({ userToken, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get("/protected", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Spotify authentication: Request user authorization
app.get('/auth/login', (req, res) => {
  var scope = "user-read-private user-read-email user-top-read streaming user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-library-read user-library-modify";
  
  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

// Spotify authentication: Handle callback and request access token
app.get('/auth/callback', (req, res) => {
  const code = req.query.code;

  const authOptions = {
    url: SPOTIFY_TOKEN_URL,
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      refresh_token = body.refresh_token;
      // Redirect to the frontend with access token and refresh token
      res.redirect(`http://localhost:5173/Home?token=${access_token}&refresh_token=${refresh_token}`);
    } else {
      res.status(400).json({ error: 'Invalid token' });
    }
  });
});
// Return access token
app.get('/auth/token', (req, res) => {
  const access_token = req.query.token || null;
  if (token) {
    res.json({ access_token: access_token });
  } else {
    res.status(400).json({ error: 'Token not found' });
  }
});

app.get('/refresh_token', (req, res) => {
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.json({
        access_token: access_token
      });
    } else {
      res.status(400).json({ error: 'Unable to refresh token' });
    }
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// Authorization URL:

// Redirect the user to Spotify's authorization page from the client.
// Example: http://localhost:3000/auth/login
// Callback URL:

// Spotify redirects to your server's callback endpoint with an authorization code.
// Example: http://localhost:3000/auth/callback
// Redirect to Client with Token:

// After the server exchanges the authorization code for an access token, it redirects the user to the client with the token.
// Example: http://localhost:5173/Home?token=<ACCESS_TOKEN>