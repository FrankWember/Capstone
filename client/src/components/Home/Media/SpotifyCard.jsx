import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SpotifyCard.css";

const SpotifyCard = ({ item }) => {
  const imageUrl = item.images
    ? item.images[0]?.url
    : item.album?.images[0]?.url;
  const name = item.name || item.album?.name;
  const artists = item.artists
    ? item.artists.map((artist) => artist.name).join(", ")
    : item.album?.artists.map((artist) => artist.name).join(", ");

  return (
    <div className="card spotify-card mb-3 shadow-sm">
      {imageUrl && <img src={imageUrl} className="card-img-top" alt={name} />}
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        {artists && <p className="card-text">{artists}</p>}
      </div>
    </div>
  );
};

SpotifyCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default SpotifyCard;
