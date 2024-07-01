import React from "react";

const RecommendedMovies = ({ recommendedMovies }) => {
  return (
    <div className="recommended-section">
      <h2>Recommended</h2>
      {/* <ul>
        {recommendedMovies.map((movie, index) => (
          <li key={index}>
            {movie.title} ({movie.year})
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default RecommendedMovies;
