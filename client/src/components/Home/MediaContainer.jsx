import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MediaContainer.css";
import SpotifyCard from "./Media/SportifyCard";

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
  // Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
  const token =
    "BQAW-UnDjSrOzQPdzXlxZ_Ns9Xqydqp-xsadJd-NcxZg5XGj47p-_PHdoepvugK1ZMWksoCahM96ki3VxjZ-e9BXtnI0II4SW5xrypwSAO6HgsRy1S-k0h9m1X1KDdX9ez7yTSomZm-ACN-nxkJq_RYGH7KFwW-uFYhTVqcQN3IjRZgmEypgBTq1bUxxWLO5fD3J0o9M5YngTgyQI6weeliAs8HqJ7w3MtirOak_V_NM-3F2eYNdCJhBGIeZnvIfRfsN4yCypuesxt5GFxUGq4gw";
  async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  async function getTopTracks() {
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return (
      await fetchWebApi("v1/me/top/tracks?time_range=long_term&limit=5", "GET")
    ).items;
  }

  const topTracks = getTopTracks();

  console.log(
    topTracks?.map(
      ({ name, artists }) =>
        `${name} by ${artists.map((artist) => artist.name).join(", ")}`
    )
  );

  return (
    <div className="media-container p-3 flex-grow-1">
      <SpotifyCard movies={movies} />
    </div>
  );
};

export default MediaContainer;
