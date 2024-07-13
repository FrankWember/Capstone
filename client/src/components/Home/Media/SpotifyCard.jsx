import React from "react";
import PropTypes from "prop-types";
import { PlayIcon } from "@heroicons/react/solid";
import "./SpotifyCard.css";

const SpotifyCard = ({ item, isPlaylist, onClick }) => {
  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(item.uri);
    }
  };

  // Get the image URL to display
  const imageUrl = item.images
    ? item.images[0]?.url
    : item.album?.images[0]?.url;
  // Get the name to display
  const name = item.name || item.album?.name;
  // Get the artists to display
  const artists = item.artists
    ? item.artists.map((artist) => artist.name).join(", ")
    : item.album?.artists.map((artist) => artist.name).join(", ");

  return (
    <div className="spotify-card" onClick={handleClick}>
      <div className="spotify-card-image-wrapper">
        {imageUrl && (
          <img src={imageUrl} className="spotify-card-image" alt={name} />
        )}
        <div className="spotify-card-overlay">
          <button className="spotify-card-play-button">
            <PlayIcon className="spotify-card-play-icon" />
          </button>
        </div>
      </div>
      <div className="spotify-card-body">
        <h5 className="spotify-card-title">{name}</h5>
        {artists && <p className="spotify-card-text">{artists}</p>}
      </div>
    </div>
  );
};

SpotifyCard.propTypes = {
  item: PropTypes.object.isRequired,
  isPlaylist: PropTypes.bool,
  onClick: PropTypes.func,
};

export default SpotifyCard;
