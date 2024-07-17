const request = require("request");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const SECRET_KEY = process.env.SECRET_KEY;

const { normalizeData } = require("./normalize");

// Helper to fetch user data from my db
async function getUserData(userId) {
  const userExpression = await prisma.expression.findUnique({
    where: { user_id: userId },
  });

  const userRecommendation = await prisma.recommendation.findUnique({
    where: { user_id: userId },
  });

  const trackFeatures = await prisma.spotifyMusicTrack.findMany();

  const { normalizedUserExpression, normalizedUserRecommendation, normalizedTrackFeatures } = normalizeData({ userExpression, userRecommendation, trackFeatures });

  return { normalizedUserExpression, normalizedUserRecommendation, normalizedTrackFeatures };
}


// helper to get and store top tracks
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



// Helper to fetch data from Spotify API
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

// Helper to store tracks in the database
async function storeTracks(tracksData, access_token) {
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

// Helper function for user signup
async function signup(email, password, name) {
  // Sanity Check to verify if user already exists in the database
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash the user's password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in the database with hashed password
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  return user;
}

// Helper function for user login
async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const userToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

  return { userToken, user_id: user.id, user };
}


module.exports = {
  getUserData,
  getAndStoreTopTracks,
  storeTracks,
  getTrackFeatures,
  signup,
  login,
};
