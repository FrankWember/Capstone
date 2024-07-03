import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SpotifyCard.css";

const SpotifyCard = ({ item }) => {
  return (
    <div className="card spotify-card mb-3 shadow-sm">
      <img
        src={item.album.images[0]?.url}
        className="card-img-top"
        alt={item.name}
      />
      <div className="card-body">
        <h5 className="card-title">{item.name}</h5>
        <p className="card-text">
          {item.artists.map((artist) => artist.name).join(", ")}
        </p>
      </div>
    </div>
  );
};

SpotifyCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default SpotifyCard;
