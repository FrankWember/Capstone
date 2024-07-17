import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../SideBar/SideBar";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import SpotifyCard from "../../Home/Media/SpotifyCard";
import "./CategoryPage.css";

const CategoryPage = ({ token, setCurrentTrackUri }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState(null);

  const fetchWebApi = async (endpoint, method = "GET", body) => {
    try {
      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return await res.json();
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const getCategoryPlaylists = async () => {
    const data = await fetchWebApi(
      `v1/browse/categories/${categoryId}/playlists`
    );
    if (data) {
      setPlaylists(data.playlists.items);
      setCategoryName(data.playlists.name);
    }
  };

  useEffect(() => {
    if (token) {
      getCategoryPlaylists();
    }
  }, [token, categoryId]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="category-page">
      <SideBar />
      <div className="category-content">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="back-icon" />
          Back
        </button>
        <h1 className="category-name">{categoryName}</h1>
        <div className="category-grid">
          {playlists.map((playlist) => (
            <SpotifyCard
              key={playlist.id}
              item={playlist}
              token={token}
              type="playlist"
              onClick={() => setCurrentTrackUri(playlist.uri)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
