import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MediaContainer.css";
import SideBar from "../SideBar/SideBar";
import SpotifyCard from "./Media/SpotifyCard";
import CategoryCard from "./Media/CategoryCard";
import { useNavigate } from "react-router-dom";
import Pagination from "./Media/Pagination";

const MediaContainer = ({ token, setCurrentTrackUri, theme, toggleTheme }) => {
  const [data, setData] = useState({}); // Initializing state for data
  const [error, setError] = useState(null); // Initializing state for error handling
  const [loading, setLoading] = useState(false); // Initializing state for loading status
  const [sectionIndex, setSectionIndex] = useState(2); // Setting the starting section index
  const [fetchedSections, setFetchedSections] = useState([
    "topTracks",
    "moodRecommendedTracks",
    "placeBasedCategories",
  ]); // Initializing fetched sections state
  const navigate = useNavigate(); // Initializing navigation hook

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
  ]; // Defining sections to fetch

  const fetchWebApi = async (endpoint, method = "GET", body, retries = 3) => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      }); // Fetching data from Spotify API

      if (res.status === 429 && retries > 0) {
        const retryAfter = res.headers.get("Retry-After");
        await new Promise((resolve) =>
          setTimeout(resolve, (retryAfter || 1) * 1000)
        ); // Handling rate limit by retrying after specified time
        return fetchWebApi(endpoint, method, body, retries - 1);
      }

      if (!res.ok) throw new Error(`Error: ${res.status}`); // Handling errors
      return await res.json(); // Returning fetched data as JSON
    } catch (error) {
      setError(error.message); // Setting error state
      return null;
    }
  };

  const fetchData = async (section) => {
    setLoading(true); // Setting loading state to true
    setError(null); // Resetting error state
    let fetchedData;

    switch (section) {
      case "topTracks":
        fetchedData = await fetchWebApi("me/top/tracks?limit=5"); // Fetching top tracks
        break;
      case "moodRecommendedTracks":
        const userId = localStorage.getItem("userId");
        const url = `http://localhost:3000/recommend-tracks?user_id=${userId}`;
        const response = await axios.get(url); // Fetching mood recommended tracks
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
        const categoryIds = response2.data.categories; // Fetching place-based categories
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
        fetchedData = fetchedData.categories; // Fetching general categories
        break;
      case "followedArtists":
        fetchedData = await fetchWebApi("me/following?type=artist"); // Fetching followed artists
        break;
      case "savedAudiobooks":
        fetchedData = await fetchWebApi("me/audiobooks"); // Fetching saved audiobooks
        break;
      case "recommendedTracks":
        const topTracks = await fetchWebApi("me/top/tracks?limit=5");
        const seedTrackIds = topTracks.items.map((track) => track.id).join(",");
        fetchedData = await fetchWebApi(
          `recommendations?seed_tracks=${seedTrackIds}&limit=5`
        ); // Fetching recommended tracks
        break;
      case "recentlyPlayedTracks":
        fetchedData = await fetchWebApi("me/player/recently-played?limit=25"); // Fetching recently played tracks
        break;
      case "savedPlaylist":
        fetchedData = await fetchWebApi("me/playlists"); // Fetching saved playlists
        break;
      default:
        fetchedData = null;
    }

    await new Promise((resolve) => setTimeout(resolve, 700)); // Adding delay for smoother UI update
    setData((prevData) => ({
      ...prevData,
      [section]:
        fetchedData.items ||
        fetchedData.tracks ||
        fetchedData.artists?.items ||
        fetchedData,
    })); // Updating data state
    setLoading(false); // Setting loading state to false
  };

  useEffect(() => {
    if (token && fetchedSections.length === 3) {
      fetchedSections.forEach(fetchData); // Fetching initial sections data
    }
  }, [token, fetchedSections]);

  useEffect(() => {
    if (token && fetchedSections[sectionIndex]) {
      fetchData(fetchedSections[sectionIndex]); // Fetching data when section index changes
    }
  }, [token, sectionIndex, fetchedSections]);

  const handlePlayTrack = (trackUri) => {
    setCurrentTrackUri(trackUri); // Handling play track action
  };

  const handlePrevSection = () => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1); // Handling previous section navigation
    }
  };

  const handleNextSection = () => {
    if (sectionIndex < sections.length - 1) {
      const nextSectionIndex = sectionIndex + 1;
      const nextSection = sections[nextSectionIndex];
      if (!fetchedSections.includes(nextSection)) {
        setFetchedSections([...fetchedSections, nextSection]); // Adding next section to fetched sections if not already present
      }
      setSectionIndex(nextSectionIndex); // Handling next section navigation
    }
  };

  const sectionComponents = {
    topTracks: {
      title: "Your Top 5 Tracks",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.uri)}
          isLoading={isLoading}
        />
      ),
    },
    moodRecommendedTracks: {
      title: "Recommended Based on Your Mood",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.uri)}
          isLoading={isLoading}
        />
      ),
    },
    placeBasedCategories: {
      title: "Place Based Categories",
      renderItem: (item, isLoading) => (
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
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      ),
    },
    categories: {
      title: "Categories",
      renderItem: (item, isLoading) => (
        <CategoryCard
          key={item.id}
          item={item}
          token={token}
          type="category"
          onClick={() => navigate(`/category/${item.id}`)}
          isLoading={isLoading}
        />
      ),
    },
    followedArtists: {
      title: "Your Top Artists",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="artist"
          onClick={() => navigate(`/artist/${item.id}`)}
          isLoading={isLoading}
        />
      ),
    },
    savedAudiobooks: {
      title: "Your Favorite Audiobooks",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="audiobook"
          onClick={() => handlePlayTrack(item.uri)}
          isLoading={isLoading}
        />
      ),
    },
    recommendedTracks: {
      title: "Recommended Tracks",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.uri)}
          isLoading={isLoading}
        />
      ),
    },
    recentlyPlayedTracks: {
      title: "Recently Played Tracks",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.track.id}
          item={item.track}
          token={token}
          type="track"
          onClick={() => handlePlayTrack(item.track.uri)}
          isLoading={isLoading}
        />
      ),
    },
    savedPlaylist: {
      title: "Your Saved Playlists",
      renderItem: (item, isLoading) => (
        <SpotifyCard
          key={item.id}
          item={item}
          token={token}
          type="playlist"
          onClick={() => navigate(`/playlist/${item.id}`)}
          isLoading={isLoading}
        />
      ),
    },
  }; // Defining components for each section

  const currentSection = fetchedSections[sectionIndex];
  const sectionData = Array.isArray(data[currentSection])
    ? data[currentSection]
    : []; // Getting current section data

  if (error) {
    return <div className="error-message">Error: {error}</div>; // Rendering error message if any
  }

  return (
    <div
      className={`app-container ${
        theme === "dark" ? "dark-theme" : "light-theme"
      }`}
    >
      <SideBar theme={theme} setTheme={toggleTheme} /> {/* Rendering sidebar */}
      <div className="media-container">
        {fetchedSections.slice(0, sectionIndex + 1).map((section, index) => (
          <div key={index} className="section">
            <h3 className="section-title">
              <span className="icon">🎵</span>
              {sectionComponents[section]?.title || "Loading..."}
            </h3>
            <div className="gridItem">
              {(data[section] || []).map((item) =>
                sectionComponents[section].renderItem(item, loading)
              )}
            </div>
          </div>
        ))}{" "}
        {/* Rendering fetched sections */}
        <Pagination
          currentSection={sectionIndex}
          totalSections={sections.length}
          onPrev={handlePrevSection}
          onNext={handleNextSection}
        />{" "}
        {/* Rendering pagination */}
      </div>
    </div>
  );
};

export default MediaContainer; // Exporting the component
