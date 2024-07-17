require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const request = require('request');
const { PrismaClient } = require("@prisma/client");

const {
  getAndStoreTopTracks,
  signup,
  login,
} = require("./helpers"); // Import helper functions


const prisma = new PrismaClient();

const app = express(); // Initialize the Express app

app.use(cors()); // Enable CORS for all routes, allowing cross-origin requests
app.use(express.json()); // Middleware to parse JSON request bodies

// Spotify API and authentication configuration
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; // Spotify Client ID from environment variables
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // Spotify Client Secret from environment variables
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI; // Spotify Redirect URI from environment variables
const SECRET_KEY = process.env.SECRET_KEY; // Secret key for JWT signing from environment variables

// Endpoint for user signup
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body; // Extract user details from request body

  try {
    const user = await signup(email, password, name);
    res.status(201).json(user); // Respond with the created user
  } catch (error) {
    res.status(400).json({ error: error.message }); // Handle errors
  }
});

// Endpoint for user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { userToken, user_id, user } = await login(email, password);
    res.json({ userToken, user_id, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected route example
app.get("/protected", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ user_id: decoded.user_id }); // Respond with the user ID
  } catch (error) {
    res.status(401).json({ error: error.message }); // Handle errors
  }
});

// Request user authorization from Spotify
app.get("/auth/login", async (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  console.log("Login User_id:", user_id);

  const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-recently-played",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read",
    "user-library-modify",
    "user-follow-read",
    "user-follow-modify",
    "ugc-image-upload",
    "app-remote-control",
  ].join(" ");

  const authQueryParameters = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: user_id,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" + authQueryParameters.toString()
  );
});

// Handle callback and request access token from Spotify
app.get("/auth/callback", (req, res) => {
  const code = req.query.code;
  const user_id = req.query.state; // Extracting the user_id from the state parameter

  console.log("Callback State (user_id):", user_id);

  const authOptions = {
    url: SPOTIFY_TOKEN_URL,
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  request.post(authOptions, async (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { access_token, refresh_token } = body;

      await getAndStoreTopTracks(access_token);

      res.redirect(
        `http://localhost:5173/home?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  });
});

// Endpoint to return access and refresh tokens
app.get("/auth/token", (req, res) => {
  // Extract access_token and refresh_token from query parameters
  const access_token = req.query.access_token || null;
  const refresh_token = req.query.refresh_token || null;

  console.log(refresh_token);

  // Check if both tokens are present
  if (access_token && refresh_token) {
    res.json({ access_token, refresh_token }); // Respond with the tokens
  } else {
    res.status(400).json({ error: "Token not found" }); // Handle errors
  }
});

// Endpoint to refresh access token
app.get("/refresh_token", (req, res) => {
  const refresh_token = req.query.refresh_token;

  // Options for the token refresh request
  const authOptions = {
    url: SPOTIFY_TOKEN_URL,
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  // Request a new access token using the refresh token
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token; // Extract the new access token from response
      res.json({ access_token: access_token }); // Respond with the new access token
    } else {
      res.status(400).json({ error: "Unable to refresh token" }); // Handle errors
    }
  });
});


app.post("/save-recommendation", async (req, res) => {
  const { user_id, location, weather, place_types } = req.body;
  const parsedUserId = parseInt(user_id, 10);

  try {
    // Check if a recommendation for the user already exists
    const existingRecommendation = await prisma.recommendation.findUnique({
      where: { user_id: parsedUserId },
    });

    let recommendation;
    if (existingRecommendation) {
      // Update the existing recommendation
      recommendation = await prisma.recommendation.update({
        where: { user_id: parsedUserId },
        data: {
          location: location || "",
          weather: weather || "",
          place_types: place_types || "",
        },
      });
    } else {
      // Create a new recommendation
      recommendation = await prisma.recommendation.create({
        data: {
          user_id: parsedUserId,
          location: location || "",
          weather: weather || "",
          place_types: place_types || "",
        },
      });
    }

    res.status(201).json(recommendation);
  } catch (error) {
    console.error("Error saving recommendation:", error);
    res.status(500).json({ error: "Failed to save recommendation" });
  }
});
app.post("/save-expression", async (req, res) => {
  const { user_id, expression_value } = req.body;
  const parsedUserId = parseInt(user_id, 10);
console.log(req);
  try {
    // Check if an expression for this user already exists in my db
    const existingExpression = await prisma.expression.findUnique({
      where: { user_id: parsedUserId },
    });

    let expression;
    if (existingExpression) {
      // Update the existing expression
      expression = await prisma.expression.update({
        where: { user_id: parsedUserId },
        data: {
          expression_value: expression_value || "",
        },
      });
    } else {
      // Create a new expression
      expression = await prisma.expression.create({
        data: {
          user_id: parsedUserId,
          expression_value: expression_value || "",
        },
      });
    }

    res.status(201).json(expression);
  } catch (error) {
    console.error("Error saving expression:", error);
    res.status(500).json({ error: "Failed to save expression" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
