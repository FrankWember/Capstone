import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import MovieCards from "./Media/MovieCard";
const MediaContainer = () => {
  const movies = [
    { title: "Inception", year: "2010" },
    { title: "The Matrix", year: "1999" },
    { title: "Interstellar", year: "2014" },
    { title: "Blade Runner 2049", year: "2017" },
  ];

  return (
    <div className="media-container p-3 flex-grow-1">
      <MovieCards movies={movies} />
    </div>
  );
};

export default MediaContainer;
