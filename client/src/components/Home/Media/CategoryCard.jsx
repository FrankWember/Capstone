import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./CategoryCard.css";
import SkeletonSpotifyCard from "./SportifySkeleton";

const CategoryCard = ({ item, onClick, isLoading }) => {
  const navigate = useNavigate();

  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(item.uri);
    }
  };

  // Get the image URL to display
  const imageUrl =
    item.icons && item.icons.length > 0 ? item.icons[0].url : null;

  // Get the name to display
  const name = item.name;

  // Show skeleton card while loading
  if (isLoading) {
    return <SkeletonSpotifyCard />;
  }

  return (
    <div className="category-card" onClick={handleClick}>
      <div className="category-card-image-wrapper">
        {imageUrl && (
          <img src={imageUrl} className="category-card-image" alt={name} />
        )}
      </div>
      <div className="category-card-body">
        <h5 className="category-card-title">{name}</h5>
      </div>
    </div>
  );
};

CategoryCard.propTypes = {
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
};

export default CategoryCard;
