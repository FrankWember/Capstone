import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SearchIcon, UserCircleIcon } from "@heroicons/react/solid";
import "./SideBar.css";

function SideBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", search);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <HomeIcon className="sidebar-icon" />
        <span className="sidebar-text">MoodTune</span>
      </div>
      <form className="sidebar-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Search"
          value={search}
          onChange={handleSearchChange}
        />
        <button type="submit">
          <SearchIcon className="sidebar-icon" />
        </button>
      </form>
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
      <div className="sidebar-user" onClick={() => navigate("/profile")}>
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
