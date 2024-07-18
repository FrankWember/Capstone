const request = require("request");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const SECRET_KEY = process.env.SECRET_KEY;

const { normalizeData } = require("./normalize");

// Helper to fetch user data from my db
async function getRecommendation(userId) {
  const userExpression = await prisma.expression.findUnique({
    where: { user_id: userId },
  });

  const userRecommendation = await prisma.recommendation.findUnique({
    where: { user_id: userId },
  });

  const trackFeatures = await prisma.spotifyMusicTrack.findMany();

  const {
    normalizedUserExpression,
    normalizedUserRecommendation,
    normalizedTrackFeatures,
  } = normalizeData({ userExpression, userRecommendation, trackFeatures });
  // console.log(normalizedUserRecommendation, normalizedUserExpression);

  const recommendedTracks = recommendTracks({
    normalizedUserExpression,
    normalizedUserRecommendation,
    normalizedTrackFeatures,
  });

  // console.log("Recommended tracks:", recommendedTracks[1]);

  return recommendedTracks;
}

function recommendTracks({
  normalizedUserExpression,
  normalizedUserRecommendation,
  normalizedTrackFeatures,
}) {
  const { mood } = normalizedUserExpression || {};
  const { weatherCondition, temperature } = normalizedUserRecommendation || {};

  // Defining detailed criteria for recommendation based on mood
  const moodCriteria = {
    happy: { minValence: 0.5, minEnergy: 0.5 },
    sad: { maxValence: 0.6, maxEnergy: 0.7 },
    angry: { maxValence: 0.3, minEnergy: 0.6, minLoudness: -7 },
  };

  // Defining criteria for recommendation based on weather
  const weatherCriteria = {
    clear: { minEnergy: 0.5, minValence: 0.5 },
    cloudy: { maxEnergy: 0.6, maxValence: 0.4 },
    rain: { maxEnergy: 0.5, maxLiveness: 0.4 },
    storm: { maxEnergy: 0.4, maxValence: 0.3 },
  };

  // Defining criteria for recommendation based on temperature
  const temperatureCriteria = {
    cold: { maxTempo: 110, maxEnergy: 0.6 },
    mild: { minValence: 0.4, minEnergy: 0.4 },
    hot: { minTempo: 90, minEnergy: 0.5 },
  };

  // Determining temperature range
  let tempCriteria = {};
  if (temperature <= 10) {
    tempCriteria = temperatureCriteria.cold;
  } else if (temperature > 10 && temperature <= 25) {
    tempCriteria = temperatureCriteria.mild;
  } else {
    tempCriteria = temperatureCriteria.hot;
  }

  // Function that checks if a weather condition has a keyword
  const matchesWeatherCondition = (condition, keyword) => {
    return condition.toLowerCase().includes(keyword.toLowerCase());
  };

  // Combining criteria based on available conditions
  let criteria = {};
  if (mood && weatherCondition) {
    // Find the matching weather criteria based on keywords
    const matchingWeatherKey = Object.keys(weatherCriteria).find((key) =>
      matchesWeatherCondition(weatherCondition, key)
    );
    criteria = {
      ...moodCriteria[mood],
      ...weatherCriteria[matchingWeatherKey],
      ...tempCriteria,
    };
  } else if (mood) {
    criteria = { ...moodCriteria[mood] };
  } else if (weatherCondition) {
    const matchingWeatherKey = Object.keys(weatherCriteria).find((key) =>
      matchesWeatherCondition(weatherCondition, key)
    );
    criteria = { ...weatherCriteria[matchingWeatherKey], ...tempCriteria };
  } else {
    criteria = { ...tempCriteria };
  }

  // console.log('Combining Criteria:', criteria);

  //Filtering it based on mood criteria

  let filteredTracks = normalizedTrackFeatures;
  if (mood) {
    filteredTracks = filteredTracks.filter(
      (track) =>
        (!criteria.minValence || track.valence >= criteria.minValence) &&
        (!criteria.maxValence || track.valence <= criteria.maxValence) &&
        (!criteria.minEnergy || track.energy >= criteria.minEnergy) &&
        (!criteria.maxEnergy || track.energy <= criteria.maxEnergy) &&
        (!criteria.minLoudness || track.loudness >= criteria.minLoudness) &&
        (!criteria.maxLoudness || track.loudness <= criteria.maxLoudness)
    );
    console.log("After mood filtering:", filteredTracks.length);
  }

  // Filternig it based on weather criteria
  if (weatherCondition) {
    const matchingWeatherKey = Object.keys(weatherCriteria).find((key) =>
      matchesWeatherCondition(weatherCondition, key)
    );
    if (matchingWeatherKey) {
      const weatherCrit = weatherCriteria[matchingWeatherKey];
      filteredTracks = filteredTracks.filter(
        (track) =>
          (!weatherCrit.minValence ||
            track.valence >= weatherCrit.minValence) &&
          (!weatherCrit.maxValence ||
            track.valence <= weatherCrit.maxValence) &&
          (!weatherCrit.minEnergy || track.energy >= weatherCrit.minEnergy) &&
          (!weatherCrit.maxEnergy || track.energy <= weatherCrit.maxEnergy) &&
          (!weatherCrit.minDanceability ||
            track.danceability >= weatherCrit.minDanceability) &&
          (!weatherCrit.maxDanceability ||
            track.danceability <= weatherCrit.maxDanceability) &&
          (!weatherCrit.maxLiveness ||
            track.liveness <= weatherCrit.maxLiveness) &&
          (!weatherCrit.minLoudness ||
            track.loudness >= weatherCrit.minLoudness) &&
          (!weatherCrit.maxLoudness ||
            track.loudness <= weatherCrit.maxLoudness) &&
          (!weatherCrit.minTempo || track.tempo >= weatherCrit.minTempo) &&
          (!weatherCrit.maxTempo || track.tempo <= weatherCrit.maxTempo)
      );
      console.log("After weather filtering:", filteredTracks.length);
    }
  }

  //Filtering it based on temperature criteria
  if (temperature !== undefined) {
    filteredTracks = filteredTracks.filter(
      (track) =>
        (!tempCriteria.minValence ||
          track.valence >= tempCriteria.minValence) &&
        (!tempCriteria.maxValence ||
          track.valence <= tempCriteria.maxValence) &&
        (!tempCriteria.minEnergy || track.energy >= tempCriteria.minEnergy) &&
        (!tempCriteria.maxEnergy || track.energy <= tempCriteria.maxEnergy) &&
        (!tempCriteria.minDanceability ||
          track.danceability >= tempCriteria.minDanceability) &&
        (!tempCriteria.maxDanceability ||
          track.danceability <= tempCriteria.maxDanceability) &&
        (!tempCriteria.maxLiveness ||
          track.liveness <= tempCriteria.maxLiveness) &&
        (!tempCriteria.minLoudness ||
          track.loudness >= tempCriteria.minLoudness) &&
        (!tempCriteria.maxLoudness ||
          track.loudness <= tempCriteria.maxLoudness) &&
        (!tempCriteria.minTempo || track.tempo >= tempCriteria.minTempo) &&
        (!tempCriteria.maxTempo || track.tempo <= tempCriteria.maxTempo)
    );
    console.log("After temperature filtering:", filteredTracks.length);
  }

  return filteredTracks;
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
    where: { email },
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

  const userToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" }); // Token expires in 1 hour

  return { userToken, user_id: user.id, user };
}

module.exports = {
  getRecommendation,
  getAndStoreTopTracks,
  storeTracks,
  getTrackFeatures,
  signup,
  login,
};
