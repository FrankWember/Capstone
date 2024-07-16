import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./CategoryCard.css";

const CategoryCard = ({ item }) => {
  const navigate = useNavigate();

  // Handle click event
  const handleClick = () => {
    navigate(`/category/${item.id}`);
  };

  // Get the image URL to display
  const imageUrl = item.icons ? item.icons[0]?.url : null;

  // Get the name to display
  const name = item.name;

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
};

export default CategoryCard;
