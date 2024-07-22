import React, { useEffect, useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Screens/Login/Login";
import Home from "./components/Home/Home";
import SpotifyPlayer from "./components/Home/Media/SpotifyPlayer";
import "./App.css";

const Signup = React.lazy(() => import("./components/Screens/Signup/Signup"));
const Playlist = React.lazy(() =>
  import("./components/Screens/Playlist/Playlist")
);
const ArtistPage = React.lazy(() =>
  import("./components/Screens/ArtistPage/ArtistPage")
);
const CategoryPage = React.lazy(() =>
  import("./components/Screens/CategoryPage/CategoryPage")
);
const Recommendation = React.lazy(() =>
  import("./components/Screens/Recommendation/Recommendation")
);
const FaceRecognition = React.lazy(() =>
  import("./components/Screens/FaceRecognition/FaceRecognition")
);

const ProtectedRoute = ({ children }) => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  // Managing the state of the components
  const [token, setToken] = useState("");
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const extractTokensFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      if (accessToken) {
        localStorage.setItem("spotifyToken", accessToken);
        setToken(accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("spotifyRefreshToken", refreshToken);
      }

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
    const interval = setInterval(refreshAccessToken, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
                <Home token={token} setCurrentTrackUri={setCurrentTrackUri} />
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
                    weather={weather}
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
                  <FaceRecognition token={token} />
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
                    setCurrentTrackUri={setCurrentTrackUri}
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
                    setCurrentTrackUri={setCurrentTrackUri}
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
                    setCurrentTrackUri={setCurrentTrackUri}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
        {token && currentTrackUri && (
          <SpotifyPlayer token={token} trackUri={currentTrackUri} />
        )}
      </div>
    </Router>
  );
};

export default App;
