import React, { useState, useEffect } from "react";
import "./MediaContainer.css";
import SideBar from "../SideBar/SideBar";
import SpotifyCard from "./Media/SpotifyCard";
import { useNavigate } from "react-router-dom";

const MediaContainer = ({ token, weather }) => {
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [savedPlaylist, setSavedPlaylist] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper function to make API requests to Spotify
  const fetchWebApi = async (endpoint, method = "GET", body) => {
    try {
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return await res.json(); // Return the response data as JSON
    } catch (error) {
      setError(error.message); // Set any errors to the state
      return null;
    }
  };

  // Fetch the user's top tracks from Spotify
  const getTopTracks = async () => {
    const data = await fetchWebApi("v1/me/top/tracks?limit=5");
    if (data) setTopTracks(data.items); // Set the fetched top tracks to the state
  };

  // Fetch recommendations based on the user's top tracks
  const getRecommendations = async (seedTracks) => {
    const seedTrackIds = seedTracks.map((track) => track.id).join(",");
    const data = await fetchWebApi(
      `v1/recommendations?seed_tracks=${seedTrackIds}&limit=5`
    );
    if (data) setRecommendedTracks(data.tracks); // Set the fetched recommendations to the state
  };

  // Fetch the user's saved playlists from Spotify
  const getSavedPlaylist = async () => {
    const data = await fetchWebApi("v1/me/playlists");
    if (data) setSavedPlaylist(data.items); // Set the fetched saved playlists to the state
  };

  // Fetch the featured playlists from Spotify
  const getFeaturedPlaylists = async () => {
    const data = await fetchWebApi("v1/browse/featured-playlists");
    if (data) setFeaturedPlaylists(data.playlists.items); // Set the fetched featured playlists to the state
  };

  // Use useEffect to fetch data when the token changes
  useEffect(() => {
    if (token) {
      getTopTracks().then((topTracks) => {
        if (topTracks) getRecommendations(topTracks);
      });
      getSavedPlaylist();
      getFeaturedPlaylists();
    }
  }, [token]);

  // Display an error message if there was an error fetching data
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <SideBar />
      {weather && (
        <div className="weather-info">
          <h3>Current Weather</h3>
          <p>{weather.name}</p>
          <p>{weather.weather[0].description}</p>
          <p>{weather.main.temp}°C</p>
        </div>
      )}

      <div className="media-container">
        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Your Top 5 Tracks
          </h3>
          <div className="gridItem">
            {topTracks.map((track) => (
              <SpotifyCard key={track.id} item={track} />
            ))}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Recommended Tracks
          </h3>
          <div className="gridItem">
            {recommendedTracks.map((track) => (
              <SpotifyCard key={track.id} item={track} />
            ))}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Your Saved Playlists
          </h3>
          <div className="gridItem">
            {savedPlaylist.map((playlist) => (
              <SpotifyCard
                key={playlist.id}
                item={playlist}
                isPlaylist
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              />
            ))}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Featured Playlists
          </h3>
          <div className="gridItem">
            {featuredPlaylists.map((playlist) => (
              <SpotifyCard
                key={playlist.id}
                item={playlist}
                isPlaylist
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaContainer;
