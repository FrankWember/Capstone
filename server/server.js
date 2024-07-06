require("dotenv").config(); // Loads environment variables from a .env file into process.env
const express = require("express"); // Express framework for building the web server
const cors = require("cors"); // Middleware to enable Cross-Origin Resource Sharing
const bcrypt = require("bcryptjs"); // Library to hash passwords
const jwt = require("jsonwebtoken"); // Library to create and verify JSON Web Tokens
const request = require("request"); // Library to make HTTP requests
const { PrismaClient } = require("@prisma/client"); // Prisma Client for interacting with the database

const app = express(); // Initialize the Express app
const prisma = new PrismaClient(); // Initialize Prisma Client to interact with the database

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
    // Check if user already exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" }); // Return error if user exists
    }

    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database with hashed password
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json(user); // Respond with the created user
  } catch (error) {
    res.status(400).json({ error: error.message }); // Handle errors
  }
});

// Endpoint for user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body; // Extract user credentials from request body

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" }); // Return error if user not found
    }

    // Verify the password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" }); // Return error if password is invalid
    }

    // Generate a JWT token
    const userToken = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Check for existing session and update or create one
    const existingSession = await prisma.session.findFirst({
      where: { userId: user.id },
    });

    if (existingSession) {
      // Update the existing session with the new token
      await prisma.session.update({
        where: { userId: user.id },
        data: { token: userToken },
      });
    } else {
      // Create a new session with the new token
      await prisma.session.create({
        data: { userId: user.id, token: userToken },
      });
    }

    res.json({ userToken, user }); // Respond with the user token and user data
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message }); // Handle errors
  }
});

// Protected route example
app.get("/protected", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ userId: decoded.userId }); // Respond with the user ID
  } catch (error) {
    res.status(401).json({ error: error.message }); // Handle errors
  }
});

// Request user authorization from Spotify
app.get("/auth/login", (req, res) => {
  // Define the required scopes for Spotify access
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read",
    "user-library-modify",
  ].join(" ");

  // Create query parameters for the authorization URL
  const authQueryParameters = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
  });

  // Redirect the user to Spotify's authorization URL
  res.redirect(
    "https://accounts.spotify.com/authorize/?" + authQueryParameters.toString()
  );
});

// Handle callback and request access token from Spotify
app.get("/auth/callback", (req, res) => {
  const code = req.query.code; // Extract authorization code from query

  // Options for the token request
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

  // Request the access and refresh tokens
  request.post(authOptions, async (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { access_token, refresh_token } = body; // Extract tokens from response
      
      // Optionally save tokens in the database if needed

      // Redirect to the frontend with tokens
      res.redirect(
        `http://localhost:5173/home?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    } else {
      res.status(400).json({ error: "Invalid token" }); // Handle errors
    }
  });
});

// Endpoint to return access and refresh tokens
app.get("/auth/token", (req, res) => {
  // Extract access_token and refresh_token from query parameters
  const access_token = req.query.access_token || null;
  const refresh_token = req.query.refresh_token || null;

  // Check if both tokens are present
  if (access_token && refresh_token) {
    res.json({ access_token, refresh_token }); // Respond with the tokens
  } else {
    res.status(400).json({ error: "Token not found" }); // Handle errors
  }
});

// Endpoint to refresh access token
app.get("/refresh_token", (req, res) => {
  const refresh_token = req.query.refresh_token; // Extract refresh_token from query parameters

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

// Set the server port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log that the server is running
});


// Load environment variables from .env file.
// Import necessary libraries (express, cors, bcryptjs, jsonwebtoken, request, and @prisma/client).
// Express App Initialization:

// Initialize the Express application and Prisma Client.
// Enable CORS for all routes to allow cross-origin requests.
// Use middleware to parse JSON request bodies.
// Spotify API Configuration:

// Set up constants for Spotify API URLs and credentials.
// User Signup Endpoint (/signup):

// Handles user registration by checking for existing users, hashing the password, and creating a new user in the database.
// User Login Endpoint (/login):

// Handles user login by verifying email and password, generating a JWT token, and managing user sessions in the database.
// Protected Route Example (/protected):

// A sample protected route that requires a valid JWT token to access and responds with the user ID.
// Spotify Authentication Endpoints:

// /auth/login: Redirects users to Spotify for authorization.
// /auth/callback: Handles the callback from Spotify, exchanges the authorization code for access and refresh tokens, and redirects to the frontend.
// /auth/token: Returns the access and refresh tokens if present.
// /refresh_token: Refreshes the access token using the refresh token.
// Server Initialization:

// Sets the server to listen on a specified port or default to port 3000 and logs that the server is running.