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

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-white"
      style={{
        position: "relative",
        width: "310px",
        position: "fixed",
        top: 0,
        left: 0,
        fontFamily: "Roboto, sans-serif",
        height: "100vh",
        borderRadius: "30px", // Ensure this property is correctly applied
        backgroundColor: "#181818", // Add background color for visibility
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
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/trending" className="nav-link text-white">
            Trending
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/favorites" className="nav-link text-white">
            Favorites
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/playlists" className="nav-link text-white">
            Playlists
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/books" className="nav-link text-white">
            Books
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/news" className="nav-link text-white">
            News
          </Link>
        </li>
      </ul>
      <hr />

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
