import React, { useState, useEffect } from "react";
import "./MediaContainer.css";
import SideBar from "../SideBar/SideBar";
import SpotifyCard from "./Media/SpotifyCard";
import CategoryCard from "./Media/CategoryCard";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "./Media/SpotifyPlayer";

const MediaContainer = ({ token, setCurrentTrackUri }) => {
  // State to store various data
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
  const [savedPlaylist, setSavedPlaylist] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [savedAudiobooks, setSavedAudiobooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to fetch data from the Spotify API with retry mechanism
  const fetchWebApi = async (endpoint, method = "GET", body, retries = 3) => {
    try {
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (res.status === 429 && retries > 0) {
        const retryAfter = res.headers.get("Retry-After");
        await new Promise((resolve) =>
          setTimeout(resolve, (retryAfter || 1) * 1000)
        );
        return fetchWebApi(endpoint, method, body, retries - 1);
      }

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return await res.json();
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  // Function to get the user's top tracks
  const getTopTracks = async () => {
    const data = await fetchWebApi("v1/me/top/tracks?limit=5");
    if (data) {
      setTopTracks(data.items);
      return data.items;
    }
    return [];
  };

  // Function to get track recommendations based on seed tracks
  const getRecommendations = async (seedTracks) => {
    const seedTrackIds = seedTracks.map((track) => track.id).join(",");
    const data = await fetchWebApi(
      `v1/recommendations?seed_tracks=${seedTrackIds}&limit=5`
    );
    if (data) setRecommendedTracks(data.tracks);
  };

  // Function to get the user's recently played tracks
  const getRecentlyPlayedTracks = async () => {
    const data = await fetchWebApi("v1/me/player/recently-played?limit=25");
    if (data) setRecentlyPlayedTracks(data.items);
  };

  // Function to get the user's followed artists
  const getFollowedArtists = async () => {
    const data = await fetchWebApi("v1/me/following?type=artist");
    if (data) setFollowedArtists(data.artists.items);
  };

  // Function to get the user's saved audiobooks
  const getSavedAudiobooks = async () => {
    const data = await fetchWebApi("v1/me/audiobooks");
    if (data) setSavedAudiobooks(data.items);
  };

  // Function to get the user's saved playlists
  const getSavedPlaylist = async () => {
    const data = await fetchWebApi("v1/me/playlists");
    if (data) setSavedPlaylist(data.items);
  };

  // Function to get featured playlists
  const getFeaturedPlaylists = async () => {
    const data = await fetchWebApi("v1/browse/featured-playlists");
    if (data) setFeaturedPlaylists(data.playlists.items);
  };

  // Function to get categories
  const getCategories = async () => {
    const data = await fetchWebApi("v1/browse/categories?limit=20");
    if (data) setCategories(data.categories.items);
  };

  // Fetch data when the component mounts and when the token changes
  useEffect(() => {
    if (token) {
      getTopTracks();
      // getRecommendations(topTracks);
      getFollowedArtists();
      getSavedAudiobooks();
      getSavedPlaylist();
      getFeaturedPlaylists();
      getRecentlyPlayedTracks();
      getCategories();
    }
  }, [token]);

  // Handle play track action
  const handlePlayTrack = (trackUri) => {
    setCurrentTrackUri(trackUri);
  };

  // Render error message if there is an error
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <SideBar />
      <div className="media-container">
        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Your Top 5 Tracks
          </h3>
          <div className="gridItem">
            {topTracks.map((track) => (
              <SpotifyCard
                key={track.id}
                item={track}
                token={token}
                type="track"
                onClick={() => handlePlayTrack(track.uri)}
              />
            ))}
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Categories
          </h3>
          <div className="gridItem">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                item={category}
                token={token}
                type="category"
              />
            ))}
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Your Top Artists
          </h3>
          <div className="gridItem">
            {followedArtists.map((artist) => (
              <SpotifyCard
                key={artist.id}
                item={artist}
                token={token}
                type="artist"
                onClick={() => navigate(`/artist/${artist.id}`)}
              />
            ))}
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <span className="icon">📚</span>
            Your Favorite Audiobooks
          </h3>
          <div className="gridItem">
            {savedAudiobooks.map((audiobook) => (
              <SpotifyCard
                key={audiobook.id}
                item={audiobook}
                token={token}
                type="audiobook"
                onClick={() => handlePlayTrack(audiobook.uri)}
              />
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
              <SpotifyCard
                key={track.id}
                item={track}
                token={token}
                type="track"
                onClick={() => handlePlayTrack(track.uri)}
              />
            ))}
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">
            <span className="icon">🎵</span>
            Recently Played Tracks
          </h3>
          <div className="gridItem">
            {recentlyPlayedTracks.map((track) => (
              <SpotifyCard
                key={track.track.id}
                item={track.track}
                token={token}
                type="track"
                onClick={() => handlePlayTrack(track.track.uri)}
              />
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
                token={token}
                type="playlist"
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
                token={token}
                type="playlist"
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
