  const request = require("request");
  const { PrismaClient } = require("@prisma/client");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");

  const prisma = new PrismaClient();
  const SPOTIFY_API_URL = "https://api.spotify.com/v1";
  const SECRET_KEY = process.env.SECRET_KEY;

  const { normalizeData } = require("./normalize");

  //Endpoint to get the Ideal category based on the place type

  const getMusicCategoriesForPlaceTypes = async (userId) => {
    try {
      // Fetch the record from the database
      const recommendation = await prisma.recommendation.findUnique({
        where: { user_id: userId },
      });
      console.log(recommendation);
      if (!recommendation) {
        throw new Error('Recommendation not found for the given user ID');
      }

      // Parse the comma-separated place types from my db
      const placeTypes = recommendation.place_types.split(',');

      // Map each place types to music categories
      const musicCategories = placeTypes.map(type => placeTypeToMusicCategory[type.trim()]);

      // Remove duplicated value and filter out undefined values from my dataset
      const uniqueMusicCategories = [...new Set(musicCategories)].filter(Boolean);

      return uniqueMusicCategories;
    } catch (error) {
      console.error('Error fetching music categories for place types:', error);
      throw error;
    }
  };

  const userId = 1; 
  getMusicCategoriesForPlaceTypes(userId)
    .then(categories => {
      console.log('Ideal music categories:', categories);
    })
    .catch(error => {
      console.error('Error:', error);
    });







  // Helper to fetch user data from my db
  async function getRecommendation(userId) {
    const userExpression = await prisma.expression.findUnique({
      where: { user_id: userId },
    });

    const userRecommendation = await prisma.recommendation.findUnique({
      where: { user_id: userId },
    });

    const trackFeatures = await prisma.spotifyMusicTrack.findMany();

    const { normalizedUserExpression, normalizedUserRecommendation, normalizedTrackFeatures } = normalizeData({ userExpression, userRecommendation, trackFeatures });
    console.log(normalizedUserRecommendation, normalizedUserExpression);

    const recommendedTracks = recommendTracks({ 
      normalizedUserExpression, 
      normalizedUserRecommendation, 
      normalizedTrackFeatures 
    });
    
    console.log('Recommended tracks:', recommendedTracks[1]);

    return recommendedTracks;
  }


  // function to recommend tracks based on weather and mood
  function recommendTracks({ normalizedUserExpression, normalizedUserRecommendation, normalizedTrackFeatures }) {
    const { mood } = normalizedUserExpression || {};
    const { weatherCondition, temperature } = normalizedUserRecommendation || {};

    // Defining the criteria for recommendation based on mood
    const moodCriteria = {
      happy: { minValence: 0.8, minEnergy: 0.8 },
      sad: { maxValence: 0.8, maxEnergy: 0.7 },
      angry: { minTempo: 115, minEnergy: 0.5, minLoudness: -4 },
    };

    // Defining the criteria for recommendation based on weather
    const weatherCriteria = {
      clear: { minEnergy: 0.9, minValence: 0.5 },
      cloudy: { maxEnergy: 0.6, maxValence: 0.4 },
      rain: { maxEnergy: 0.5, maxLiveness: 0.4 },
      storm: { maxEnergy: 0.4, maxValence: 0.3 },
    };

    // Determine temperature range

    const tempCriteria = getTemperatureCriteria(temperature);

    // Combining the criteria based on available conditions
    let criteria = {};
    if (mood && weatherCondition) {
      const matchingWeatherKey = Object.keys(weatherCriteria).find(key => matchesWeatherCondition(weatherCondition, key));
      criteria = { ...moodCriteria[mood], ...weatherCriteria[matchingWeatherKey], ...tempCriteria };
    } else if (mood) {
      criteria = { ...moodCriteria[mood] };
    } else if (weatherCondition) {
      const matchingWeatherKey = Object.keys(weatherCriteria).find(key => matchesWeatherCondition(weatherCondition, key));
      criteria = { ...weatherCriteria[matchingWeatherKey], ...tempCriteria };
    } else {
      criteria = { ...tempCriteria };
    }

    let filteredTracks = normalizedTrackFeatures;
    console.log(criteria);
    // Filter tracks based on criteria
    if (mood) {
      filteredTracks = filterTracks(filteredTracks, criteria);
      console.log('After mood filtering:', filteredTracks.length);
    }

    if (weatherCondition) {
      const matchingWeatherKey = Object.keys(weatherCriteria).find(key => matchesWeatherCondition(weatherCondition, key));
      if (matchingWeatherKey) {
        const weatherCrit = weatherCriteria[matchingWeatherKey];
        filteredTracks = filterTracks(filteredTracks, weatherCrit);
        console.log('After weather filtering:', filteredTracks.length);
      }
    }

    if (temperature !== undefined) {
      filteredTracks = filterTracks(filteredTracks, tempCriteria);
      console.log('After temperature filtering:', filteredTracks.length);
    }

    return filteredTracks;
  }


  // Helper function to check if a weather condition has a keyword
  const matchesWeatherCondition = (condition, keyword) => {
    return condition.toLowerCase().includes(keyword.toLowerCase());
  };

  // Helper function to filter tracks based on criteria
  const filterTracks = (tracks, criteria) => {
    return tracks.filter(track => (
      (!criteria.minValence || track.valence >= criteria.minValence) &&
      (!criteria.maxValence || track.valence <= criteria.maxValence) &&
      (!criteria.minEnergy || track.energy >= criteria.minEnergy) &&
      (!criteria.maxEnergy || track.energy <= criteria.maxEnergy) &&
      (!criteria.minDanceability || track.danceability >= criteria.minDanceability) &&
      (!criteria.maxDanceability || track.danceability <= criteria.maxDanceability) &&
      (!criteria.maxLiveness || track.liveness <= criteria.maxLiveness) &&
      (!criteria.minLoudness || track.loudness >= criteria.minLoudness) &&
      (!criteria.maxLoudness || track.loudness <= criteria.maxLoudness) &&
      (!criteria.minTempo || track.tempo >= criteria.minTempo) &&
      (!criteria.maxTempo || track.tempo <= criteria.maxTempo)
    ));
  };

  // Helper function to determine temperature criteria
  const getTemperatureCriteria = (temperature) => {
    const temperatureCriteria = {
      cold: { maxTempo: 110, maxEnergy: 0.6 },
      mild: { minValence: 0.8, minEnergy: 0.8 },
      hot: { minTempo: 90, minEnergy: 0.5 },
    };

    if (temperature <= 10) {
      return temperatureCriteria.cold;
    } else if (temperature > 10 && temperature <= 25) {
      return temperatureCriteria.mild;
    } else {
      return temperatureCriteria.hot;
    }
  };





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


  // Mapping of popular place types gotten form the placeApi documentation to music categories using keywords
// Mapping of popular place types to one-word Spotify music categories
const placeTypeToMusicCategory = {
  // Sports
  "fitness_center": "0JQ5DAqbMKFAXlCG6QvYQ4", // Workout
  "gym": "0JQ5DAqbMKFAXlCG6QvYQ4", // Workout
  "stadium": "0JQ5DAqbMKFRieVZLLoo9m", // Sports

  // Transportation
  "airport": "0JQ5DAqbMKFAQy4HL4XU2D", // Travel
  "bus_station": "0JQ5DAqbMKFAQy4HL4XU2D", // Travel
  "train_station": "0JQ5DAqbMKFAQy4HL4XU2D", // Travel

  // Locality and Political areas
  "locality": "0JQ5DAqbMKFzHmL4tf05da", // Made For You
  "political": "0JQ5DAqbMKFzHmL4tf05da", // Made For You

  // Education
  "library": "0JQ5DAqbMKFCbimwdOYlsl", // Focus
  "university": "0JQ5DAqbMKFIRybaNTYXXy", // Student

  // Entertainment and Recreation
  "amusement_park": "0JQ5DAqbMKFLVaM30PMBm4", // Summer
  "aquarium": "0JQ5DAqbMKFFzDl7qN9Apr", // Chill
  "casino": "0JQ5DAqbMKFGaKcChsSgUO", // New Releases
  "movie_theater": "0JQ5DAqbMKFOzQeOmemkuw", // TV & Movies
  "night_club": "0JQ5DAqbMKFQ00XGBls6ym", // Hip-Hop
  "park": "0JQ5DAqbMKFFzDl7qN9Apr", // Chill
  "tourist_attraction": "0JQ5DAqbMKFGnsSfvg90Wo", // GLOW
  "zoo": "0JQ5DAqbMKFFoimhOqWzLB", // Kids & Family

  // Food and Drink
  "restaurant": "0JQ5DAqbMKFRY5ok2pxXJ0", // Cooking & Dining
  "bakery": "0JQ5DAqbMKFRY5ok2pxXJ0", // Cooking & Dining
  "bar": "0JQ5DAqbMKFQ00XGBls6ym", // Hip-Hop
  "cafe": "0JQ5DAqbMKFFzDl7qN9Apr", // Chill
  "coffee_shop": "0JQ5DAqbMKFFzDl7qN9Apr", // Chill
  "fast_food_restaurant": "0JQ5DAqbMKFRY5ok2pxXJ0", // Cooking & Dining

  // Health and Wellness
  "dentist": "0JQ5DAqbMKFGhyqJpZMRM2", // Wellness
  "doctor": "0JQ5DAqbMKFGhyqJpZMRM2", // Wellness
  "hospital": "0JQ5DAqbMKFGhyqJpZMRM2", // Wellness
  "pharmacy": "0JQ5DAqbMKFGhyqJpZMRM2", // Wellness
  "spa": "0JQ5DAqbMKFFzDl7qN9Apr", // Chill

  // Lodging
  "hotel": "0JQ5DAqbMKFGvOw3O4nLAf", // Travel
  "motel": "0JQ5DAqbMKFGvOw3O4nLAf", // Travel
  "resort_hotel": "0JQ5DAqbMKFGvOw3O4nLAf", // Travel

  // Places of Worship
  "church": "0JQ5DAqbMKFy0OenPG51Av", // Christian & Gospel
  "mosque": "0JQ5DAqbMKFy0OenPG51Av", // Religion
  "synagogue": "0JQ5DAqbMKFy0OenPG51Av", // Religion

  // Shopping
  "book_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "clothing_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "convenience_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "department_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "electronics_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "furniture_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "grocery_store": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping
  "shopping_mall": "0JQ5DAqbMKFJw7QLnM27p6", // Pop
  "supermarket": "0JQ5DAqbMKFRieVZLLoo9m", // Shopping

  // Automotive
  "car_dealer": "0JQ5DAqbMKFCuoRTxhYWow", // In the car
  "car_rental": "0JQ5DAqbMKFCuoRTxhYWow", // In the car
  "car_repair": "0JQ5DAqbMKFCuoRTxhYWow", // In the car
  "car_wash": "0JQ5DAqbMKFCuoRTxhYWow", // In the car
  "gas_station": "0JQ5DAqbMKFCuoRTxhYWow", // In the car
  "parking": "0JQ5DAqbMKFCuoRTxhYWow", // In the car

  // Culture
  "art_gallery": "0JQ5DAqbMKFKhGk5Hh3mFo", // Art
  "museum": "0JQ5DAqbMKFKhGk5Hh3mFo", // Art
};

// Example of how to use the mapping
const getSpotifyCategory = (placeType) => {
  return placeTypeToMusicCategory[placeType] || "Chill"; // Default to "Chill" if place type is not found
};

// Example usage
const placeType = "cafe";
const spotifyCategory = getSpotifyCategory(placeType);
console.log(`Spotify category for ${placeType}: ${spotifyCategory}`);


  module.exports = {
    getMusicCategoriesForPlaceTypes,
    getRecommendation,
    getAndStoreTopTracks,
    storeTracks,
    getTrackFeatures,
    signup,
    login,
  };
