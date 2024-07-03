import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import SpotifyCard from "./Media/SpotifyCard";

const MediaContainer = ({ token }) => {
  const [userData, setUserData] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [error, setError] = useState(null);

  console.log("Token:", token);

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

  async function getUserProfile() {
    const data = await fetchWebApi("v1/me");
    if (data) {
      setUserData(data);
      console.log("User Profile Data:", data);
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

  useEffect(() => {
    if (token) {
      getUserProfile();
      getTopTracks().then((topTracks) => {
        if (topTracks) {
          getRecommendations(topTracks);
        }
      });
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
      {userData && (
        <div className="card mb-4">
          <div className="card-body text-center">
            <h2 className="card-title">{userData.display_name}</h2>
            <img
              src={userData.images[0]?.url}
              alt="Profile"
              className="img-fluid rounded-circle mb-3"
            />
            <p className="card-text">Email: {userData.email}</p>
          </div>
        </div>
      )}
      <div>
        <h3>Your Top 5 Tracks</h3>
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
    </div>
  );
};

export default MediaContainer;
