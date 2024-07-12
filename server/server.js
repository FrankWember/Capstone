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
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; // Spotify Client ID from environment variables
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // Spotify Client Secret from environment variables
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI; // Spotify Redirect URI from environment variables
const SECRET_KEY = process.env.SECRET_KEY; // Secret key for JWT signing from environment variables

// Endpoint for user signup
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body; // Extract user details from request body

  try {
    // Sanity Check to verify if user already exists in the database
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
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const userToken = jwt.sign({ user_id: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    const existingSession = await prisma.session.findFirst({
      where: { user_id: user.id },
    });

    if (existingSession) {
      await prisma.session.update({
        where: { id: existingSession.id },
        data: { token: userToken },
      });
    } else {
      await prisma.session.create({
        data: { user_id: user.id, token: userToken },
      });
    }

    res.json({ userToken, user_id: user.id, user });
  } catch (error) {
    console.log(error);
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
    state: user_id, // Include user_id in the state parameter
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" + authQueryParameters.toString()
  );
});

// Handle callback and request access token from Spotify
app.get("/auth/callback", (req, res) => {
  const code = req.query.code;
  const user_id = req.query.state; // Extract user_id from the state parameter

  // Log state to verify it contains the user_id
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

      // Log user_id to ensure it's correctly extracted &
      console.log("Extracted user_id:", user_id);

      await getAndStoreTopTracks(access_token);

      res.redirect(
        `http://localhost:5173/home?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  });
});

// Function to get and store top tracks
async function getAndStoreTopTracks(access_token) {
  try {
    const userTopTracks = await fetchSpotifyData(
      `${SPOTIFY_API_URL}/me/top/tracks`,
      access_token
    );
    await storeTracks(userTopTracks, access_token);

    const userRecentlyListen = await fetchSpotifyData(
      `${SPOTIFY_API_URL}/me/player/recently-played?limit=50`,
      access_token
    );
    const recentlyPlayedTracks = userRecentlyListen.items.map(
      (item) => item.track
    );

    await storeTracks({ items: recentlyPlayedTracks }, access_token);

    const userTopArtists = await fetchSpotifyData(
      `${SPOTIFY_API_URL}/me/top/artists`,
      access_token
    );

    for (const artist of userTopArtists.items) {
      const artistTopTracks = await fetchSpotifyData(
        `${SPOTIFY_API_URL}/artists/${artist.id}/top-tracks?market=US`,
        access_token
      );
      await storeTracks(artistTopTracks, access_token);
    }
  } catch (error) {
    console.error("Error fetching or storing top tracks:", error);
  }
}

// Helper function to fetch data from Spotify API
async function fetchSpotifyData(url, access_token) {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: { Authorization: `Bearer ${access_token}` },
      json: true,
    };
    request.get(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

// Helper function to store tracks in the database
async function storeTracks(tracksData, access_token) {
  // Determine the correct array to iterate over
  const items = tracksData.items || tracksData.tracks;

  if (!items) {
    console.error("Error: No tracks data available to store.");
    return;
  }

  for (const track of items) {
    // Check if the track already exists
    const existingTrack = await prisma.spotifyMusicTrack.findUnique({
      where: { spotify_id: track.id },
    });

    if (!existingTrack) {
      // If the track doesn't exist, create it
      await prisma.spotifyMusicTrack.create({
        data: {
          spotify_id: track.id,
          name: track.name,
          artists: track.artists.map((artist) => artist.name).join(", "),
          album: track.album.name,
          preview_url: track.preview_url,
          features: await getTrackFeatures(track.id, access_token),
        },
      });
    }
  }
}

// Function to get track features from Spotify API
async function getTrackFeatures(trackId, access_token) {
  const options = {
    url: `${SPOTIFY_API_URL}/audio-features/${trackId}`,
    headers: { Authorization: `Bearer ${access_token}` },
    json: true,
  };
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

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

// Endpoint to save recommendation
app.post("/save-recommendation", async (req, res) => {
  const { user_id, location, weather, place_types, expression } = req.body;
  console.log("Request body:", req.body);

  try {
    const recommendation = await prisma.recommendation.create({
      data: {
        user_id: parseInt(user_id, 10),
        location,
        weather,
        place_types,
        expression: expression || "",
      },
    });

    res.status(201).json(recommendation);
  } catch (error) {
    console.error("Error saving recommendation:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/save-expression", async (req, res) => {
  const { user_id, expression } = req.body;
  console.log(req.body);

  try {
    const recommendation = await prisma.recommendation.updateMany({
      where: { user_id: parseInt(user_id, 10) },
      data: { expression },
    });

    res.status(201).json(recommendation);
  } catch (error) {
    console.error("Error saving expression:", error);
    res.status(400).json({ error: error.message });
  }
});

// Set the server port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log that the server is running
});
