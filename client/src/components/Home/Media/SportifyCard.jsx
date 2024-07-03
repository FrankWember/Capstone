import React from "react";
import PropTypes from "prop-types";

const SpotifyCard = ({ item }) => {
  return (
    <div className="spotify-card">
      <img src={item.album.images[0].url} alt={item.name} />
      <div>
        <h5>{item.name}</h5>
        <p>{item.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
    </div>
  );
};

SpotifyCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default SpotifyCard;
