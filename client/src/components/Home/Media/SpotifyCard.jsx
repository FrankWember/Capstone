import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { PlayIcon } from "@heroicons/react/solid";
import "./SpotifyCard.css";
import SkeletonSpotifyCard from "./SportifySkeleton";

const SpotifyCard = ({ item, type, onClick, isLoading }) => {
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

  if (isLoading) {
    return <SkeletonSpotifyCard type={type} />;
  }

  return (
    <div className={`spotify-card spotify-card-${type}`} onClick={handleClick}>
      <div
        className={`spotify-card-image-wrapper spotify-card-image-wrapper-${type}`}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            className={`spotify-card-image spotify-card-image-${type}`}
            alt={name}
          />
        )}
        <div className="spotify-card-overlay">
          <PlayIcon className="spotify-card-play-button" />
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
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
};

export default SpotifyCard;
