import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MediaContainer.css"; // Import custom CSS for styling
import SpotifyCard from "./Media/SpotifyCard"; // Import a component to display individual items
import { PlayIcon } from "@heroicons/react/outline"; // Import an icon from the Heroicons library
import PlaylistPage from "../Screens/PlaylistTracks/PlaylistPage";

// MediaContainer component definition
const MediaContainer = ({ token }) => {
  // State variables to hold different types of data
  const [topTracks, setTopTracks] = useState([]); // State for top tracks
  const [recommendedTracks, setRecommendedTracks] = useState([]); // State for recommended tracks
  const [savedPlaylist, setSavedPlaylist] = useState([]); // State for user's saved playlists
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]); // State for featured playlists
  const [playlistTracks, setPlaylistTracks] = useState([]); // State for tracks of a specific playlist
  const [playlistDetails, setPlaylistDetails] = useState({}); // State for details of a specific playlist
  const [error, setError] = useState(null); // State for error messages

  // useParams hook to access URL parameters (e.g., playlistId)
  const { playlistId } = useParams();
  // useNavigate hook to programmatically navigate to different routes
  const navigate = useNavigate();

  // Function to fetch data from the Spotify Web API
  const fetchWebApi = async (endpoint, method = "GET", body) => {
    try {
      // Make a request to the Spotify API
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`, // Use the token for authentication
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      // If the response is not OK, throw an error
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      // Return the parsed JSON data
      return await res.json();
    } catch (error) {
      // Set the error message in state
      setError(error.message);
      return null;
    }
  };

  // Function to fetch the user's top tracks
  const getTopTracks = async () => {
    const data = await fetchWebApi("v1/me/top/tracks?limit=5"); // Fetch top 5 tracks
    if (data) setTopTracks(data.items); // Set the fetched data to the state
  };

  // Function to fetch recommended tracks based on seed tracks
  const getRecommendations = async (seedTracks) => {
    const seedTrackIds = seedTracks.map((track) => track.id).join(","); // Get comma-separated seed track IDs
    const data = await fetchWebApi(
      `v1/recommendations?seed_tracks=${seedTrackIds}&limit=5`
    );
    if (data) setRecommendedTracks(data.tracks); // Set the fetched data to the state
  };

  // Function to fetch the user's saved playlists
  const getSavedPlaylist = async () => {
    const data = await fetchWebApi("v1/me/playlists"); // Fetch user's playlists
    if (data) setSavedPlaylist(data.items); // Set the fetched data to the state
  };

  // Function to fetch featured playlists
  const getFeaturedPlaylists = async () => {
    const data = await fetchWebApi("v1/browse/featured-playlists"); // Fetch featured playlists
    if (data) setFeaturedPlaylists(data.playlists.items); // Set the fetched data to the state
  };

  // Function to fetch tracks from a specific playlist
  const getPlaylistTracks = async (playlistId) => {
    const data = await fetchWebApi(`v1/playlists/${playlistId}/tracks`);
    if (data) setPlaylistTracks(data.items); // Set the fetched data to the state
  };

  // Function to fetch details of a specific playlist
  const getPlaylistDetails = async (playlistId) => {
    const data = await fetchWebApi(`v1/playlists/${playlistId}`);
    if (data) setPlaylistDetails(data); // Set the fetched data to the state
  };

  // useEffect hook to fetch initial data when the component mounts
  useEffect(() => {
    if (token) {
      getTopTracks().then((topTracks) => {
        if (topTracks) getRecommendations(topTracks); // Fetch recommendations after getting top tracks
      });
      getSavedPlaylist(); // Fetch saved playlists
      getFeaturedPlaylists(); // Fetch featured playlists

      if (playlistId) {
        getPlaylistTracks(playlistId); // Fetch tracks if playlistId is present
        getPlaylistDetails(playlistId); // Fetch playlist details if playlistId is present
      }
    }
  }, [token, playlistId]); // Dependencies for the useEffect hook

  // Display an error message if any error occurs
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Render the main content of the MediaContainer
  return (
    <div className="media-container">
      <div className="content-wrapper">
        {/* Conditionally render content based on the presence of playlistId */}
        {!playlistId ? (
          <>
            {/* Top Tracks Section */}
            <div className="section">
              <h3 className="section-title">
                <span className="icon">🎵</span>
                Your Top 5 Tracks
              </h3>
              <div className="grid">
                {topTracks.map((track) => (
                  <SpotifyCard key={track.id} item={track} /> // Render each track as a SpotifyCard
                ))}
              </div>
            </div>
            {/* Recommended Tracks Section */}
            <div className="section">
              <h3 className="section-title">
                <span className="icon">🎵</span>
                Recommended Tracks
              </h3>
              <div className="grid">
                {recommendedTracks.map((track) => (
                  <SpotifyCard key={track.id} item={track} /> // Render each recommended track as a SpotifyCard
                ))}
              </div>
            </div>
            {/* Saved Playlists Section */}
            <div className="section">
              <h3 className="section-title">
                <span className="icon">🎵</span>
                Your Saved Playlists
              </h3>
              <div className="grid">
                {savedPlaylist.map((playlist) => (
                  <SpotifyCard
                    key={playlist.id}
                    item={playlist}
                    isPlaylist
                    onClick={() => navigate(`/playlist/${playlist.id}`)} // Navigate to PlaylistPage on click
                  />
                ))}
              </div>
            </div>
            {/* Featured Playlists Section */}
            <div className="section">
              <h3 className="section-title">
                <span className="icon">🎵</span>
                Featured Playlists
              </h3>
              <div className="grid">
                {featuredPlaylists.map((playlist) => (
                  <SpotifyCard
                    key={playlist.id}
                    item={playlist}
                    isPlaylist
                    onClick={() => navigate(`/playlist/${playlist.id}`)} // Navigate to PlaylistPage on click
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <PlaylistPage token={token} />
          </>
        )}
      </div>
    </div>
  );
};

export default MediaContainer;
