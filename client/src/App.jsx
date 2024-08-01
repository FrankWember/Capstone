import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes, // Importing Routes to define our app's routes
  Route, // Importing Route to specify each route
  Navigate, // Importing Navigate to handle redirects
} from "react-router-dom";
import Login from "./components/Screens/Login/Login";
import Home from "./components/Home/Home";
import SpotifyPlayer from "./components/Home/Media/SpotifyPlayer";
import "./App.css"; // Importing the main CSS file for the app

// Lazy loading components for better performance
const Signup = lazy(() => import("./components/Screens/Signup/Signup"));
const Playlist = lazy(() => import("./components/Screens/Playlist/Playlist"));
const ArtistPage = lazy(() =>
  import("./components/Screens/ArtistPage/ArtistPage")
);
const CategoryPage = lazy(() =>
  import("./components/Screens/CategoryPage/CategoryPage")
);
const Recommendation = lazy(() =>
  import("./components/Screens/Recommendation/Recommendation")
);
const FaceRecognition = lazy(() =>
  import("./components/Screens/FaceRecognition/FaceRecognition")
);

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return <Navigate to="/" />; // Redirect to login if no token is found
  }

  return children;
};

const App = () => {
  // State management for tokens, current track, user location, player visibility, and theme
  const [token, setToken] = useState("");
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [theme, setTheme] = useState("light"); // State for theme

  useEffect(() => {
    const extractTokensFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      // Store tokens in local storage and update state
      if (accessToken) {
        localStorage.setItem("spotifyToken", accessToken);
        setToken(accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("spotifyRefreshToken", refreshToken);
      }

      // Remove tokens from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    extractTokensFromURL();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      const userToken = localStorage.getItem("userToken");
      const accessToken = localStorage.getItem("spotifyToken");
      const refreshToken = localStorage.getItem("spotifyRefreshToken");
      if (userToken && accessToken && refreshToken) {
        try {
          const response = await fetch(
            `http://localhost:3000/auth/token?access_token=${accessToken}&refresh_token=${refreshToken}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          const data = await response.json();
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("spotifyToken", data.access_token);
          }
        } catch (error) {
          console.error("Failed to fetch token:", error);
        }
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const refreshAccessToken = async () => {
      const userToken = localStorage.getItem("userToken");
      const refreshToken = localStorage.getItem("spotifyRefreshToken");
      if (userToken) {
        try {
          const response = await fetch(
            `http://localhost:3000/refresh_token?refresh_token=${refreshToken}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          const data = await response.json();
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("spotifyToken", data.access_token);
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      }
    };
    refreshAccessToken();
    const interval = setInterval(refreshAccessToken, 55 * 60 * 1000); // Refresh token every 55 minutes
    return () => clearInterval(interval);
  }, []);

  // Handler for changing the current track
  const handleTrackChange = (uri) => {
    setCurrentTrackUri(uri);
    setShowPlayer(true);
  };

  // Handler for closing the player
  const handleClosePlayer = () => {
    setShowPlayer(false);
    setCurrentTrackUri(null);
  };

  // Handler for toggling the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      <div className="Home">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/signup"
            element={
              <Suspense
                fallback={
                  <h1>
                    <div>Loading...</div>
                  </h1>
                }
              >
                <Signup />
              </Suspense>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home
                  token={token}
                  setCurrentTrackUri={handleTrackChange}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendation"
            element={
              <ProtectedRoute>
                <Suspense
                  fallback={
                    <h1>
                      <div>Loading...</div>
                    </h1>
                  }
                >
                  <Recommendation
                    token={token}
                    userLocation={userLocation}
                    setUserLocation={setUserLocation}
                    theme={theme}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/face_mood"
            element={
              <ProtectedRoute>
                <Suspense
                  fallback={
                    <h1>
                      <div>Loading...</div>
                    </h1>
                  }
                >
                  <FaceRecognition
                    token={token}
                    theme={theme}
                    toggleTheme={toggleTheme}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/:categoryId"
            element={
              <ProtectedRoute>
                <Suspense
                  fallback={
                    <h1>
                      <div>Loading...</div>
                    </h1>
                  }
                >
                  <CategoryPage
                    token={token}
                    setCurrentTrackUri={handleTrackChange}
                    theme={theme}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlist/:playlistId"
            element={
              <ProtectedRoute>
                <Suspense
                  fallback={
                    <h1>
                      <div>Loading...</div>
                    </h1>
                  }
                >
                  <Playlist
                    token={token}
                    setCurrentTrackUri={handleTrackChange}
                    theme={theme}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/artist/:artistId"
            element={
              <ProtectedRoute>
                <Suspense
                  fallback={
                    <h1>
                      <div>Loading...</div>
                    </h1>
                  }
                >
                  <ArtistPage
                    token={token}
                    setCurrentTrackUri={handleTrackChange}
                    theme={theme}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
        {/* Conditional rendering of the SpotifyPlayer component */}
        {showPlayer && token && currentTrackUri && (
          <SpotifyPlayer
            token={token}
            trackUri={currentTrackUri}
            onClose={handleClosePlayer}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
