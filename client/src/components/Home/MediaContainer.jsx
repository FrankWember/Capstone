import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MediaContainer.css";
import SideBar from "../SideBar/SideBar";
import SpotifyCard from "./Media/SpotifyCard";
import CategoryCard from "./Media/CategoryCard";
import { useNavigate } from "react-router-dom";
import Pagination from "./Media/Pagination";

const MediaContainer = ({ token, setCurrentTrackUri }) => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(2); // Start with the first 3 sections
  const [fetchedSections, setFetchedSections] = useState([
    "topTracks",
    "moodRecommendedTracks",
    "placeBasedCategories",
  ]);
  const navigate = useNavigate();

  const sections = [
    "topTracks",
    "moodRecommendedTracks",
    "placeBasedCategories",
    "categories",
    "followedArtists",
    "savedAudiobooks",
    "recommendedTracks",
    "recentlyPlayedTracks",
    "savedPlaylist",
    "featuredPlaylists",
  ];

  const fetchWebApi = async (endpoint, method = "GET", body, retries = 3) => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (res.status === 429 && retries > 0) {
        const retryAfter = res.headers.get("Retry-After");
        await new Promise((resolve) =>
          setTimeout(resolve, (retryAfter || 1) * 1000)
        );
        return fetchWebApi(endpoint, method, body, retries - 1);
      }

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return await res.json();
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const fetchData = async (section) => {
    setLoading(true);
    setError(null);
    let fetchedData;

    switch (section) {
      case "topTracks":
        fetchedData = await fetchWebApi("me/top/tracks?limit=5");
        break;
      case "moodRecommendedTracks":
        const userId = localStorage.getItem("userId");
        const url = `http://localhost:3000/recommend-tracks?user_id=${userId}`;
        const response = await axios.get(url);
        const tracksData = await Promise.all(
          response.data.map(async (track) => {
            const trackDetails = await fetchWebApi(`tracks/${track.spotifyId}`);
            return trackDetails;
          })
        );
        fetchedData = { items: tracksData };
        break;
      case "placeBasedCategories":
        const userId2 = localStorage.getItem("userId");
        const response2 = await axios.get(
          `http://localhost:3000/music-categories/${userId2}`
        );
        const categoryIds = response2.data.categories;
        const categoriesData = await Promise.all(
          categoryIds.map(async (categoryId) => {
            const categoryData = await fetchWebApi(
              `browse/categories/${categoryId}`
            );
            const categoryPlaylists = await fetchWebApi(
              `browse/categories/${categoryId}/playlists?limit=5`
            );
            return {
              ...categoryData,
              playlists: categoryPlaylists.playlists.items,
            };
          })
        );
        fetchedData = { items: categoriesData };
        break;
      case "categories":
        fetchedData = await fetchWebApi("browse/categories?limit=20");
        fetchedData = fetchedData.categories; // Adjusting data structure for categories
        break;
      case "followedArtists":
        fetchedData = await fetchWebApi("me/following?type=artist");
        break;
      case "savedAudiobooks":
        fetchedData = await fetchWebApi("me/audiobooks");
        break;
      case "recommendedTracks":
        const topTracks = await fetchWebApi("me/top/tracks?limit=5");
        const seedTrackIds = topTracks.items.map((track) => track.id).join(",");
        fetchedData = await fetchWebApi(
          `recommendations?seed_tracks=${seedTrackIds}&limit=5`
        );
        break;
      case "recentlyPlayedTracks":
        fetchedData = await fetchWebApi("me/player/recently-played?limit=25");
        break;
      case "savedPlaylist":
        fetchedData = await fetchWebApi("me/playlists");
        break;
      case "featuredPlaylists":
        fetchedData = await fetchWebApi("browse/featured-playlists");
        console.log(fetchData);
        break;
      default:
        fetchedData = null;
    }

    setData((prevData) => ({
      ...prevData,
      [section]:
        fetchedData.items ||
        fetchedData.tracks ||
        fetchedData.artists?.items ||
        fetchedData,
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (token && fetchedSections.length === 3) {
      fetchedSections.forEach(fetchData);
    }
  }, [token, fetchedSections]);

  useEffect(() => {
    if (token && fetchedSections[sectionIndex]) {
      fetchData(fetchedSections[sectionIndex]);
    }
  }, [token, sectionIndex, fetchedSections]);

  const handlePlayTrack = (trackUri) => {
    setCurrentTrackUri(trackUri);
  };

  const handlePrevSection = () => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
    }
  };

  const handleNextSection = () => {
    if (sectionIndex < sections.length - 1) {
      const nextSectionIndex = sectionIndex + 1;
      const nextSection = sections[nextSectionIndex];
      if (!fetchedSections.includes(nextSection)) {
        setFetchedSections([...fetchedSections, nextSection]);
      }
      setSectionIndex(nextSectionIndex);
    }
  };

  const sectionComponents = {
    topTracks: {
      title: "Your Top 5 Tracks",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.uri)}
        />
      ),
    },
    moodRecommendedTracks: {
      title: "Recommended Based on Your Mood",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.uri)}
        />
      ),
    },
    placeBasedCategories: {
      title: "Place Based Categories",
      renderItem: (item) => (
        <div key={item.id} className="category-section">
          <h3>{item.name}</h3>
          <div className="gridItem">
            {item.playlists.map((playlist) => (
              <SpotifyCard
                key={playlist.id}
                item={playlist}
                token={token}
                type="playlist"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              />
            ))}
          </div>
        </div>
      ),
    },
    categories: {
      title: "Categories",
      renderItem: (item) => (
        <CategoryCard
          key={item.id}
          item={item}
          token={token}
          type="category"
          onClick={() => navigate(`/category/${item.id}`)}
        />
      ),
    },
    followedArtists: {
      title: "Your Top Artists",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="artist"
          onClick={() => navigate(`/artist/${item.id}`)}
        />
      ),
    },
    savedAudiobooks: {
      title: "Your Favorite Audiobooks",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="audiobook"
          onClick={() => handlePlayTrack(item.uri)}
        />
      ),
    },
    recommendedTracks: {
      title: "Recommended Tracks",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.uri)}
        />
      ),
    },
    recentlyPlayedTracks: {
      title: "Recently Played Tracks",
      renderItem: (item) => (
        <SpotifyCard
          key={item.track.id}
          item={item.track}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.track.uri)}
        />
      ),
    },
    savedPlaylist: {
      title: "Your Saved Playlists",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="playlist"
          onClick={() => navigate(`/playlist/${item.id}`)}
        />
      ),
    },
    featuredPlaylists: {
      title: "Featured Playlists",
      renderItem: (item) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="playlist"
          onClick={() => navigate(`/playlist/${item.id}`)}
        />
      ),
    },
  };

  const currentSection = fetchedSections[sectionIndex];
  const sectionData = Array.isArray(data[currentSection])
    ? data[currentSection]
    : [];

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <SideBar />
      <div className="media-container">
        {fetchedSections.slice(0, sectionIndex + 1).map((section, index) => (
          <div key={index} className="section">
            <h3 className="section-title">
              <span className="icon">🎵</span>
              {sectionComponents[section]?.title || "Loading..."}
            </h3>
            <div className="gridItem">
              {loading && sectionIndex === index ? (
                <div>Loading...</div>
              ) : (
                (data[section] || []).map((item) =>
                  sectionComponents[section].renderItem(item)
                )
              )}
            </div>
          </div>
        ))}
        <Pagination
          currentSection={sectionIndex}
          totalSections={sections.length}
          onPrev={handlePrevSection}
          onNext={handleNextSection}
        />
      </div>
    </div>
  );
};

export default MediaContainer;
