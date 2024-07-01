import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import MoviesCards from "./Media/MovieCard";
//import Movies from "../Movies/Movies";
//import RecommendedMovies from "../RecommendedMovies/RecommendedMovies";

const MediaContainer = () => {
  return (
    <div className="media-container">
      <div class="d-flex p-2">
        <div>
          <MoviesCards />
        </div>
      </div>
    </div>
  );
};

export default MediaContainer;
