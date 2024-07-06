// Import React and necessary hooks and libraries
import React from "react";
import PropTypes from "prop-types"; // PropTypes for type checking props
import { useNavigate } from "react-router-dom"; // Hook for navigation
import { PlayIcon } from "@heroicons/react/solid"; // Play icon from Heroicons library
import "./SpotifyCard.css"; // Import custom CSS for styling

// SpotifyCard component definition
const SpotifyCard = ({ item, isPlaylist }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation

  // Function to handle click events on the card
  const handleClick = () => {
    if (isPlaylist) {
      navigate(`/playlist/${item.id}`); // Navigate to playlist page if the item is a playlist
    }
  };

  // Determine the image URL to display based on the item data
  const imageUrl = item.images
    ? item.images[0]?.url
    : item.album?.images[0]?.url;

  // Determine the name to display based on the item data
  const name = item.name || item.album?.name;

  // Determine the artists to display based on the item data
  const artists = item.artists
    ? item.artists.map((artist) => artist.name).join(", ")
    : item.album?.artists.map((artist) => artist.name).join(", ");

  return (
    // Card container with styling and click handler
    <div
      className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        {/* Display image if available */}
        {imageUrl && (
          <img src={imageUrl} className="w-full h-48 object-cover" alt={name} />
        )}
        {/* Overlay with play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
          <button className="p-2 bg-green-500 rounded-full">
            <PlayIcon className="h-8 w-8 text-white" /> {/* Play icon */}
          </button>
        </div>
      </div>
      <div className="p-4">
        {/* Display name */}
        <h5 className="text-lg font-semibold text-white truncate">{name}</h5>
        {/* Display artists if available */}
        {artists && <p className="text-sm text-gray-400 truncate">{artists}</p>}
      </div>
    </div>
  );
};

// PropTypes for type checking
SpotifyCard.propTypes = {
  item: PropTypes.object.isRequired, // Item object is required
  isPlaylist: PropTypes.bool, // Optional boolean indicating if the item is a playlist
};

// Export the component as default
export default SpotifyCard;
