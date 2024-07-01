import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import MovieCards from "./Media/MovieCard";
const MediaContainer = () => {
  const movies = [
    { title: "The Shawshank Redemption", year: "1994" },
    { title: "Pulp Fiction", year: "1994" },
    { title: "Fight Club", year: "1999" },
    { title: "The Dark Knight", year: "2008" },
    { title: "Goodfellas", year: "1990" },
    { title: "The Godfather", year: "1972" },
    {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      year: "2001",
    },
    { title: "The Silence of the Lambs", year: "1991" },
    { title: "Forrest Gump", year: "1994" },
    { title: "The Shawshank Redemption", year: "1994" },
    { title: "Inglourious Basterds", year: "2009" },
    { title: "The Departed", year: "2006" },
    { title: "The Prestige", year: "2006" },
    { title: "Whiplash", year: "2014" },
    { title: "The Grand Budapest Hotel", year: "2014" },
    { title: "The Revenant", year: "2015" },
    { title: "La La Land", year: "2016" },
    { title: "Mad Max: Fury Road", year: "2015" },
    { title: "The Social Network", year: "2010" },
    { title: "Arrival", year: "2016" },
    { title: "The Shawshank Redemption", year: "1994" },
    { title: "Pulp Fiction", year: "1994" },
    { title: "Fight Club", year: "1999" },
    { title: "The Dark Knight", year: "2008" },
    { title: "Goodfellas", year: "1990" },
    { title: "The Godfather", year: "1972" },
    {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      year: "2001",
    },
    { title: "The Silence of the Lambs", year: "1991" },
    { title: "Forrest Gump", year: "1994" },
    { title: "The Shawshank Redemption", year: "1994" },
    { title: "Inglourious Basterds", year: "2009" },
    { title: "The Departed", year: "2006" },
    { title: "The Prestige", year: "2006" },
    { title: "Whiplash", year: "2014" },
    { title: "The Grand Budapest Hotel", year: "2014" },
    { title: "The Revenant", year: "2015" },
    { title: "La La Land", year: "2016" },
    { title: "Mad Max: Fury Road", year: "2015" },
    { title: "The Social Network", year: "2010" },
    { title: "Arrival", year: "2016" },
  ];
  return (
    <div className="media-container p-3 flex-grow-1">
      <MovieCards movies={movies} />
    </div>
  );
};

export default MediaContainer;
