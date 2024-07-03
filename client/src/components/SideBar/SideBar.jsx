import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Form, FormControl, Button } from "react-bootstrap";
import "@fontsource/roboto";

function SideBar() {
  const [search, setSearch] = useState("");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", search);
  };

  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:3000/auth/login"; // Adjust the URL based on your server's address and port
  };

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-white"
      style={{
        width: "350px",
        position: "fixed",
        top: 0,
        left: 0,
        fontFamily: "Roboto, sans-serif",
        backgroundColor: "#000112",
        height: "100vh",
      }}
    >
      <Link
        to="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <svg className="bi me-2" width="40" height="32">
          <use xlinkHref="#bootstrap"></use>
        </svg>
        <span className="fs-4">MoodTune</span>
      </Link>
      <Form className="d-flex mb-3" onSubmit={handleSearchSubmit}>
        <FormControl
          type="search"
          placeholder="Search"
          className="me-2"
          aria-label="Search"
          value={search}
          onChange={handleSearchChange}
        />
        <Button variant="outline-success" type="submit">
          Search
        </Button>
      </Form>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/Home" className="nav-link active" aria-current="page">
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="Home"></use>
            </svg>
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/trending" className="nav-link text-white">
            <svg className="bi me-2" width="16" height="16" color="white">
              <use xlinkHref="#trending"></use>
            </svg>
            Trending
          </Link>
        </li>
        <li>
          <Link to="/Favorites" className="nav-link text-white">
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="Favorites"></use>
            </svg>
            Favorites
          </Link>
        </li>
        <li>
          <Link to="/playlists" className="nav-link text-white">
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#playlist"></use>
            </svg>
            Playlists
          </Link>
        </li>
        <li>
          <Link to="/books" className="nav-link text-white">
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#book"></use>
            </svg>
            Books
          </Link>
        </li>
        <li>
          <Link to="/news" className="nav-link text-white">
            <svg className="bi me-2" width="16" height="16">
              <use xlinkHref="#news"></use>
            </svg>
            News
          </Link>
        </li>
      </ul>
      <hr />
      <Button variant="success" className="spotify-login-button">
        Connect with Spotify
      </Button>
      <Dropdown className="mt-auto">
        <hr />
        <Dropdown.Toggle
          variant="dark"
          className="d-flex align-items-center text-white text-decoration-none"
          id="dropdownUser1"
        >
          <img
            src="https://th.bing.com/th/id/R.5d769f89081ab24fb2d14ff3b3dcac6a?rik=XQyGumoJKbCTJQ&pid=ImgRaw&r=0"
            alt=""
            width="40"
            height="40"
            className="rounded-circle me-3"
          />
          <strong>Username</strong>
        </Dropdown.Toggle>
        <Dropdown.Menu variant="dark" className="shadow">
          <Dropdown.Item href="/profile">Profile</Dropdown.Item>
          <Dropdown.Item href="/settings">Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item href="/">Sign out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default SideBar;
