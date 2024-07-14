// src/components/Playlist/Playlist.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClockIcon, ArrowLeftIcon } from "@heroicons/react/solid";
import "./Playlist.css";
import SideBar from "../../SideBar/SideBar";

const Playlist = ({ token, setCurrentTrackUri }) => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlistDetails, setPlaylistDetails] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [error, setError] = useState(null);

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
      return await res.json();
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  useEffect(() => {
    const getPlaylistDetails = async () => {
      const details = await fetchWebApi(`v1/playlists/${playlistId}`);
      const tracks = await fetchWebApi(`v1/playlists/${playlistId}/tracks`);
      if (details && tracks) {
        setPlaylistDetails(details);
        setPlaylistTracks(tracks.items);
      }
    };

    if (token && playlistId) {
      getPlaylistDetails();
    }
  }, [token, playlistId]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="playlist-page">
      <SideBar />
      <div className="playlist-container">
        {playlistDetails && (
          <div className="playlist-header">
            <button className="back-button" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="back-icon" />
              Back
            </button>
            {playlistDetails.images && playlistDetails.images[0] && (
              <img
                src={playlistDetails.images[0].url}
                alt={playlistDetails.name}
                className="playlist-cover"
              />
            )}
            <div>
              <div className="playlist-title">{playlistDetails.name}</div>
              <div className="playlist-description">
                {playlistDetails.description}
              </div>
              <p className="playlist-owner">
                {playlistDetails.owner &&
                  `By ${playlistDetails.owner.display_name}`}
              </p>
            </div>
          </div>
        )}
        <div className="playlist-tracks">
          <table className="tracks-table">
            <thead>
              <tr>
                <th className="table-header">#</th>
                <th className="table-header">Title</th>
                <th className="table-header">Album</th>
                <th className="table-header">
                  <ClockIcon className="icon" />
                </th>
              </tr>
            </thead>
            <tbody>
              {playlistTracks.map((track, index) => (
                <tr
                  key={track.track.id}
                  className="track-row"
                  onClick={() => setCurrentTrackUri(track.track.uri)}
                >
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
                      <div className="track-details">
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
                    {formatDuration(track.track.duration_ms)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Playlist;
