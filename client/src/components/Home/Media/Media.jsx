import React from "react";

const Movies = ({ movies }) => {
  return (
    <div className="movies-section">
      <h2>Browse</h2>
      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            {movie.title} ({movie.year})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Movies;
