import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SpotifyCard.css";

const SpotifyCard = ({ item }) => {
  return (
    <div className="card mb-3">
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={item.images[0]?.url}
            className="img-fluid rounded-start"
            alt={item.name}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">{item.name}</h5>
            {item.description && (
              <p className="card-text">{item.description}</p>
            )}
            {item.tracks && (
              <p className="card-text">
                <small className="text-muted">{item.tracks.total} songs</small>
              </p>
            )}
            {item.artists && (
              <p className="card-text">
                <small className="text-muted">
                  {item.artists.map((artist) => artist.name).join(", ")}
                </small>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyCard;
