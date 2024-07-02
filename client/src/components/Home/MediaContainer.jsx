import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import SpotifyCard from "./Media/SpotifyCard";

const MediaContainer = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [error, setError] = useState(null);

  // Authorization token that must have been created previously. See: https://developer.spotify.com/documentation/web-api/concepts/authorization
  const token = "YOUR_SPOTIFY_ACCESS_TOKEN"; // Replace this with your actual token

  async function fetchWebApi(endpoint, method, body) {
    try {
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      setError(error.message);
    }
  }

  async function getTopTracks() {
    // Endpoint reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    const data = await fetchWebApi(
      "v1/me/top/tracks?time_range=long_term&limit=5",
      "GET"
    );
    return data ? data.items : [];
  }

  useEffect(() => {
    async function fetchData() {
      const tracks = await getTopTracks();
      setTopTracks(tracks);
    }
    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="media-container p-3 flex-grow-1">
      <SpotifyCard tracks={topTracks} />
    </div>
  );
};

export default MediaContainer;
