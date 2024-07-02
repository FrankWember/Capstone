import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import SpotifyCard from "./Media/SportifyCard";

const MediaContainer = () => {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState({});

  // Function to fetch data from the backend
  async function fetchBackend(endpoint) {
    const res = await fetch(`http://localhost:3000${endpoint}`, {
      method: "GET",
    });
    return await res.json();
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user playlists
        const userPlaylists = await fetchBackend("/spotify/playlists");
        setPlaylists(userPlaylists.items);

        // Fetch tracks for each playlist
        const allTracks = await Promise.all(
          userPlaylists.items.map(async (playlist) => {
            const playlistTracks = await fetchBackend(
              `/spotify/playlist/${playlist.id}/tracks`
            );
            return {
              playlistId: playlist.id,
              tracks: playlistTracks.items.map((item) => item.track),
            };
          })
        );

        const tracksObject = allTracks.reduce((acc, playlist) => {
          acc[playlist.playlistId] = playlist.tracks;
          return acc;
        }, {});

        setTracks(tracksObject);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="media-container p-3 flex-grow-1">
      <h3>Your Playlists</h3>
      <div className="spotify-playlists">
        {playlists.map((playlist) => (
          <SpotifyCard key={playlist.id} item={playlist} />
        ))}
      </div>
      <h3>Your Tracks</h3>
      {playlists.map((playlist) => (
        <div key={playlist.id}>
          <h4>{playlist.name}</h4>
          <div className="track-list">
            {tracks[playlist.id]?.map((track) => (
              <SpotifyCard key={track.id} item={track} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaContainer;
