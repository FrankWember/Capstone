import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MediaContainer.css";
import SideBar from "../SideBar/SideBar";
import SpotifyCard from "./Media/SpotifyCard";
import CategoryCard from "./Media/CategoryCard";
import { useNavigate } from "react-router-dom";
import Pagination from "./Media/Pagination";

const MediaContainer = ({ token, setCurrentTrackUri }) => {
  // State to store various data
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
  const [savedPlaylist, setSavedPlaylist] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [savedAudiobooks, setSavedAudiobooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [moodRecommendedTracks, setMoodRecommendedTracks] = useState([]);
  const [placeBasedCategories, setPlaceBasedCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(4);
  const navigate = useNavigate();

  // Function to fetch data from the Spotify API with retry mechanism for the 429 error "Too many requests" with Spotify
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

  // Function to get the user's top tracks
  const getTopTracks = async () => {
    const data = await fetchWebApi("me/top/tracks?limit=5");
    console.log(data.items);
    if (data) {
      setTopTracks(data.items);
      return data.items;
    }
    return [];
  };

  // Function to get track recommendations based on seed tracks
  const getRecommendations = async (seedTracks) => {
    const seedTrackIds = seedTracks.map((track) => track.id).join(",");
    const data = await fetchWebApi(
      `recommendations?seed_tracks=${seedTrackIds}&limit=5`
    );
    if (data) setRecommendedTracks(data.tracks);
  };

  // Function to get recommended tracks based on mood
  const getMoodRecommendedTracks = async () => {
    try {
      const userId = localStorage.getItem("userId");
      console.log(userId);
      const url = `http://localhost:3000/recommend-tracks?user_id=${userId}`;
      const response = await axios.get(url);

      const tracksData = await Promise.all(
        response.data.map(async (track) => {
          const trackDetails = await fetchWebApi(`tracks/${track.spotifyId}`);
          return trackDetails;
        })
      );

      console.log("Detailed tracks response:", tracksData);
      setMoodRecommendedTracks(tracksData);
    } catch (error) {
      console.error("Failed to fetch mood recommended tracks:", error);
      setError("Failed to fetch mood recommended tracks.");
    }
  };

  // Function to get the user's recently played tracks
  const getRecentlyPlayedTracks = async () => {
    const data = await fetchWebApi("me/player/recently-played?limit=25");
    if (data) setRecentlyPlayedTracks(data.items);
  };

  // Function to get the user's followed artists
  const getFollowedArtists = async () => {
    const data = await fetchWebApi("me/following?type=artist");
    if (data) setFollowedArtists(data.artists.items);
  };

  // Function to get the user's saved audiobooks
  const getSavedAudiobooks = async () => {
    const data = await fetchWebApi("me/audiobooks");
    if (data) setSavedAudiobooks(data.items);
  };

  // Function to get the user's saved playlists
  const getSavedPlaylist = async () => {
    const data = await fetchWebApi("me/playlists");
    if (data) setSavedPlaylist(data.items);
  };

  // Function to get featured playlists
  const getFeaturedPlaylists = async () => {
    const data = await fetchWebApi("browse/featured-playlists");
    if (data) setFeaturedPlaylists(data.playlists.items);
  };

  // Function to get categories
  const getCategories = async () => {
    const data = await fetchWebApi("browse/categories?limit=20");
    if (data) setCategories(data.categories.items);
    console.log(data);
  };

  // Function to get the place-based music categories and fetch their details from Spotify
  const getPlaceBasedCategories = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:3000/music-categories/${userId}`
      );

      const categoryIds = response.data.categories;
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

      setPlaceBasedCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch place-based categories:", error);
      setError("Failed to fetch place-based categories.");
    }
  };

  // Fetch data when the component mounts and when the token changes
  useEffect(() => {
    if (token) {
      getTopTracks();
      getMoodRecommendedTracks();
      getFollowedArtists();
      getSavedAudiobooks();
      getSavedPlaylist();
      getFeaturedPlaylists();
      getRecentlyPlayedTracks();
      getCategories();
    }
  }, [token]);

  // Fetch recommendations based on top tracks
  useEffect(() => {
    if (topTracks.length > 0) {
      getRecommendations(topTracks);
    }
  }, [topTracks]);

  // Fetch place-based categories when the component mounts
  useEffect(() => {
    if (token) {
      getPlaceBasedCategories();
    }
  }, [token]);

  // Handle play track action
  const handlePlayTrack = (trackUri) => {
    setCurrentTrackUri(trackUri);
  };

  const handlePrevSection = () => {
    if (sectionIndex > 3) {
      setSectionIndex(sectionIndex - 1);
    }
  };

  const handleNextSection = () => {
    if (sectionIndex < sections.length) {
      setSectionIndex(sectionIndex + 1);
    }
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const sections = [
    {
      title: "Your Top 5 Tracks",
      data: topTracks,
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
    {
      title: "Recommended Based on Your Mood",
      data: moodRecommendedTracks,
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
    {
      title: "Place Based Categories",
      data: placeBasedCategories,
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
    {
      title: "Categories",
      data: categories,
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
    {
      title: "Your Top Artists",
      data: followedArtists,
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
    {
      title: "Your Favorite Audiobooks",
      data: savedAudiobooks,
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
    {
      title: "Recommended Tracks",
      data: recommendedTracks,
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
    {
      title: "Recently Played Tracks",
      data: recentlyPlayedTracks,
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
    {
      title: "Your Saved Playlists",
      data: savedPlaylist,
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
    {
      title: "Featured Playlists",
      data: featuredPlaylists,
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
  ];

  return (
    <div className="app-container">
      <SideBar />
      <div className="media-container">
        {sections.slice(0, sectionIndex).map((section, index) => (
          <div key={index} className="section">
            <h3 className="section-title">
              <span className="icon">🎵</span>
              {section.title}
            </h3>
            <div className="gridItem">
              {section.data.map((item) => section.renderItem(item))}
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
