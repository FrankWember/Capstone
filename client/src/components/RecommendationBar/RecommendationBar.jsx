import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Form, FormControl, Button } from "react-bootstrap";
import "@fontsource/roboto"; // Ensure you import the font

function RecommendationBar() {
  const [search, setSearch] = useState("");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Here, you would handle the redirection or fetching of search results
    console.log("Searching for:", search);
  };

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-white"
      style={{
        width: "350px",
        position: "fixed",
        top: 0,
        right: 0,
        fontFamily: "Roboto, sans-serif",
        backgroundColor: "#000112", // Custom background color
        height: "100vh", // Ensuring it takes full viewport height
      }}
    ></div>
  );
}

export default RecommendationBar;
