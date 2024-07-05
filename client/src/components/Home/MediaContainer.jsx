import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import SpotifyCard from "./Media/SpotifyCard";

const MediaContainer = ({ token }) => {
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [savedPlaylist, setSavedPlaylist] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [error, setError] = useState(null);

  async function fetchWebApi(endpoint, method = "GET", body) {
    try {
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      setError(error.message);
      return null;
    }
  }

  async function getTopTracks() {
    const data = await fetchWebApi("v1/me/top/tracks?limit=5");
    if (data) {
      setTopTracks(data.items);
      console.log("Top Tracks Data:", data.items);
      return data.items;
    }
  }

  async function getRecommendations(seedTracks) {
    const seedTrackIds = seedTracks.map((track) => track.id).join(",");
    const data = await fetchWebApi(
      `v1/recommendations?seed_tracks=${seedTrackIds}&limit=5`
    );
    if (data) {
      setRecommendedTracks(data.tracks);
      console.log("Recommended Tracks Data:", data.tracks);
    }
  }

  async function getSavedPlaylist() {
    const data = await fetchWebApi("v1/me/playlists");
    if (data) {
      setSavedPlaylist(data.items);
      console.log("Saved Playlist Data:", data.items);
    }
  }

  async function getFeaturedPlaylists() {
    const data = await fetchWebApi("v1/browse/featured-playlists");
    if (data) {
      setFeaturedPlaylists(data.playlists.items);
      console.log("Featured Playlists Data:", data.playlists.items);
    }
  }

  useEffect(() => {
    if (token) {
      getTopTracks().then((topTracks) => {
        if (topTracks) {
          getRecommendations(topTracks);
        }
      });
      getSavedPlaylist();
      getFeaturedPlaylists();
    }
  }, [token]);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="media-container p-3 flex-grow-1">
      <div>
        <h3>Your Top 10 Tracks</h3>
        <div className="d-flex flex-wrap justify-content-between">
          {topTracks.map((track) => (
            <SpotifyCard key={track.id} item={track} />
          ))}
        </div>
      </div>
      <div>
        <h3>Recommended Tracks</h3>
        <div className="d-flex flex-wrap justify-content-between">
          {recommendedTracks.map((track) => (
            <SpotifyCard key={track.id} item={track} />
          ))}
        </div>
      </div>
      <div>
        <h3>Your Saved Playlist</h3>
        <div className="d-flex flex-wrap justify-content-between">
          {savedPlaylist.map((playlist) => (
            <SpotifyCard key={playlist.playlist.id} item={playlist.playlist} />
          ))}
        </div>
      </div>
      <div>
        <h3>Featured Playlists</h3>
        <div className="d-flex flex-wrap justify-content-between">
          {featuredPlaylists.map((playlist) => (
            <SpotifyCard key={playlist.id} item={playlist} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaContainer;
