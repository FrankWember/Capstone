// src/components/PlaylistPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PlayIcon, ChevronLeftIcon, ClockIcon } from "@heroicons/react/solid";
import "./PlaylistPage.css"; // Import custom CSS

const PlaylistPage = ({ token }) => {
  const { playlistId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [playlistDetails, setPlaylistDetails] = useState({});
  const [error, setError] = useState(null);

  // Function to fetch playlist tracks
  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      setTracks(data.items);
    } catch (error) {
      setError(error.message);
    }
  };

  // Function to fetch playlist details
  const fetchPlaylistDetails = async (playlistId) => {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      setPlaylistDetails(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (playlistId && token) {
      fetchPlaylistTracks(playlistId);
      fetchPlaylistDetails(playlistId);
    }
  }, [playlistId, token]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="playlist-page-container">
      <div className="playlist-header">
        <button className="back-button" onClick={() => window.history.back()}>
          <ChevronLeftIcon className="icon" />
        </button>
        <div className="playlist-details">
          {playlistDetails.images && playlistDetails.images[0] && (
            <img
              src={playlistDetails.images[0].url}
              alt={playlistDetails.name}
              className="playlist-cover"
            />
          )}
          <div>
            <h1 className="playlist-title">{playlistDetails.name}</h1>
            <p className="playlist-description">
              {playlistDetails.description}
            </p>
            <p className="playlist-owner">
              {playlistDetails.owner &&
                `By ${playlistDetails.owner.display_name}`}
            </p>
          </div>
        </div>
      </div>
      <div className="playlist-actions">
        <button className="play-button">
          <PlayIcon className="icon" /> Play
        </button>
      </div>
      <div className="playlist-tracks">
        <table className="tracks-table">
          <thead>
            <tr>
              <th className="table-header">#</th>
              <th className="table-header">Title</th>
              <th className="table-header">Album</th>
              <th className="table-header">Date added</th>
              <th className="table-header">
                <ClockIcon className="icon" />
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={track.track.id} className="track-row">
                <td className="table-cell">{index + 1}</td>
                <td className="table-cell track-title">
                  <div className="track-info">
                    {track.track.album.images[0] && (
                      <img
                        src={track.track.album.images[0].url}
                        alt={track.track.name}
                        className="track-cover"
                      />
                    )}
                    <div>
                      <span className="track-name">{track.track.name}</span>
                      <span className="track-artists">
                        {track.track.artists
                          .map((artist) => artist.name)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="table-cell">{track.track.album.name}</td>
                <td className="table-cell">
                  {new Date(track.added_at).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  {formatDuration(track.track.duration_ms)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to format track duration
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default PlaylistPage;
