import React from "react";
import PropTypes from "prop-types";
import "./SpotifySkeleton.css";

const SkeletonSpotifyCard = ({ type }) => {
  return (
    <div className={`spotify-card spotify-card-${type}`}>
      <div
        className={`spotify-card-image-wrapper spotify-card-image-wrapper-${type}`}
      >
        <div className="spotify-card-image skeleton skeleton-image animate-pulse"></div>
      </div>
      <div className="spotify-card-body">
        <div className="skeleton skeleton-title animate-pulse"></div>
        <div className="skeleton skeleton-text animate-pulse"></div>
      </div>
    </div>
  );
};

SkeletonSpotifyCard.propTypes = {
  type: PropTypes.string.isRequired,
};

export default SkeletonSpotifyCard;
