import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Form, FormControl, Button } from "react-bootstrap";
import "@fontsource/roboto";
import { HomeIcon, SearchIcon, UserCircleIcon } from "@heroicons/react/outline";
import "./SideBar.css"; // Import custom CSS for the sidebar

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
    <div className="sidebar d-flex flex-column p-3 text-white">
      <NavLink
        to="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        activeClassName="active"
      >
        <HomeIcon className="bi me-2" width="40" height="32" />
        <span className="fs-4">MoodTune</span>
      </NavLink>
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
          <SearchIcon className="bi me-2" width="20" height="20" />
        </Button>
      </Form>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink to="/home" className="nav-link" activeClassName="active">
            <HomeIcon className="bi me-2" width="20" height="20" />
            Home
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/recommendation"
            className="nav-link"
            activeClassName="active"
          >
            <SearchIcon className="bi me-2" width="20" height="20" />
            Recommendations
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/face_mood"
            className="nav-link"
            activeClassName="active"
          >
            <SearchIcon className="bi me-2" width="20" height="20" />
            Set your Mood
          </NavLink>
        </li>
      </ul>
      <hr />
      <Dropdown className="mt-auto">
        <Dropdown.Toggle
          variant="dark"
          className="d-flex align-items-center text-white text-decoration-none"
          id="dropdownUser1"
        >
          <UserCircleIcon className="bi me-2" width="40" height="40" />
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
