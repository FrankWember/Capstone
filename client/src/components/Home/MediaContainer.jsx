import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
//import Movies from "../Movies/Movies";
//import RecommendedMovies from "../RecommendedMovies/RecommendedMovies";

const MediaContainer = () => {
  const movies = [
    { title: "Inception", year: "2010" },
    { title: "The Matrix", year: "1999" },
    { title: "Interstellar", year: "2014" },
    { title: "Blade Runner 2049", year: "2017" },
  ];

  const recommendedMovies = [
    { title: "Arrival", year: "2016" },
    { title: "Ex Machina", year: "2015" },
    { title: "Her", year: "2013" },
    { title: "The Prestige", year: "2006" },
  ];

  return (
    <div className="media-container">
      <header className="header">
        <h1>Movies</h1>
      </header>
      <div className="container-fluid">
        <div className="col-md-8">
          <Movies movies={movies} />
        </div>
        <div className="col-md-4">
          <RecommendedMovies recommendedMovies={recommendedMovies} />
        </div>
      </div>
    </div>
  );
};

export default MediaContainer;
