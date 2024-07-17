function normalizeData({ userExpression, userRecommendation, trackFeatures }) {
    const normalizedUserExpression = userExpression
      ? {
          mood: userExpression.expression_value,
        }
      : null;
  
    // Extract temperature and weather condition from the weather description
    const weatherParts = userRecommendation.weather.split(", ");
    const temperature = parseFloat(weatherParts[0]);
    const weatherCondition = weatherParts[1];
  
    const normalizedUserRecommendation = userRecommendation
      ? {
          location: userRecommendation.location,
          temperature,
          weatherCondition,
          placeTypes: userRecommendation.place_types,
        }
      : null;
  
    const normalizedTrackFeatures = trackFeatures.map(track => ({
      spotifyId: track.spotify_id,
      name: track.name,
      artists: track.artists,
      album: track.album,
      previewUrl: track.preview_url,
      tempo: track.features.tempo,
      energy: track.features.energy,
      valence: track.features.valence,
      liveness: track.features.liveness,
      loudness: track.features.loudness,
      speechiness: track.features.speechiness,
      acousticness: track.features.acousticness,
      danceability: track.features.danceability,
      instrumentalness: track.features.instrumentalness,
    }));
  
    return { normalizedUserExpression, normalizedUserRecommendation, normalizedTrackFeatures };
  }
  
  module.exports = { normalizeData };
  