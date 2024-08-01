import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  SearchIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/solid";
import "./SideBar.css";

function SideBar({ theme, setTheme }) {
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("spotifyToken");

    const fetchPlaylists = async () => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error fetching playlists");
        }

        const data = await response.json();
        setPlaylists(data.items);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchPlaylists();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={`sidebar ${theme === "light" ? "light-theme" : "dark-theme"}`}
    >
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <HomeIcon className="sidebar-icon" />
        <span className="sidebar-text">MoodTune</span>
      </div>
      <button className="theme-toggle-button" onClick={toggleTheme}>
        {theme === "light" ? (
          <MoonIcon className="sidebar-icon" />
        ) : (
          <SunIcon className="sidebar-icon" />
        )}
      </button>
      <hr />
      <ul className="sidebar-nav">
        <li onClick={() => navigate("/home")}>
          <div className="sidebar-link">
            <HomeIcon className="sidebar-icon" />
            <span className="sidebar-text">Home</span>
          </div>
        </li>
        <li onClick={() => navigate("/recommendation")}>
          <div className="sidebar-link">
            <SearchIcon className="sidebar-icon" />
            <span className="sidebar-text">Recommendations</span>
          </div>
        </li>
        <li onClick={() => navigate("/face_mood")}>
          <div className="sidebar-link">
            <SearchIcon className="sidebar-icon" />
            <span className="sidebar-text">Set your Mood</span>
          </div>
        </li>
      </ul>
      <hr />
      <ul className="sidebar-playlists">
        {playlists.map((playlist) => (
          <li
            key={playlist.id}
            onClick={() => navigate(`/playlist/${playlist.id}`)}
          >
            <div className="sidebar-link">
              {playlist.images && playlist.images.length > 0 && (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="sidebar-playlist-cover"
                />
              )}
              <span className="sidebar-text playlist-text">
                {playlist.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <hr />
      <div className="sidebar-user" onClick={() => navigate("/")}>
        <UserCircleIcon className="sidebar-icon" />
        <strong>Username</strong>
        <div className="sidebar-dropdown">
          <div className="sidebar-dropdown-link" onClick={() => navigate("/")}>
            Sign out
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
