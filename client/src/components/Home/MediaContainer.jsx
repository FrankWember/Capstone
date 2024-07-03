import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";

const MediaContainer = ({ token }) => {
  const [userData, setUserData] = useState(null);
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

  useEffect(() => {
    if (token) {
      getUserProfile();
    }
  }, [token]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="media-container p-3 flex-grow-1">
      {userData ? (
        <div>
          <h2>{userData.display_name}</h2>
          <img src={userData.images[0]?.url} alt="Profile" />
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MediaContainer;
