import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PlayIcon, PauseIcon } from "@heroicons/react/solid"; // Import Play and Pause icons from Heroicons
import "./SpotifyPlayer.css"; // Import custom CSS for styling

const SpotifyPlayer = ({ token, trackUri }) => {
  // State to store the Spotify player instance
  const [player, setPlayer] = useState(null);
  // State to manage whether the player is paused or playing
  const [isPaused, setIsPaused] = useState(true);
  // State to store the Spotify device ID
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    // Function to initialize the Spotify player
    const initializePlayer = () => {
      const player = new window.Spotify.Player({
        name: "MoodTune Player",
        getOAuthToken: (cb) => {
          cb(token);
        },
      });

      setPlayer(player);

      // Event listener for when the player is ready
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      // Event listener for when the player goes offline
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      // Event listeners for various errors
      player.addListener("initialization_error", ({ message }) => {
        console.error("Failed to initialize", message);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.error("Failed to authenticate", message);
      });

      player.addListener("account_error", ({ message }) => {
        console.error("Failed to validate Spotify account", message);
      });

      player.addListener("playback_error", ({ message }) => {
        console.error("Failed to perform playback", message);
      });

      // Event listener for player state changes
      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setIsPaused(state.paused);
      });

      // Connect the player
      player.connect();
    };

    // Check if the Spotify SDK is already loaded
    if (window.Spotify) {
      initializePlayer();
    } else {
      // Wait for the Spotify SDK to be ready
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    }
  }, [token]);

  // Function to play a track using the Spotify player
  const play = ({
    spotify_uri,
    playerInstance: {
      _options: { getOAuthToken, id },
    },
  }) => {
    getOAuthToken((access_token) => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
        method: "PUT",
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });
    });
  };

  // Handle play/pause button click
  const handlePlayPause = () => {
    if (isPaused) {
      play({
        playerInstance: player,
        spotify_uri: trackUri,
      });
    } else {
      player.pause();
    }
  };

  return (
    <div className="spotify-player">
      <button onClick={handlePlayPause} className="spotify-player-button">
        {isPaused ? (
          <PlayIcon className="spotify-player-icon" />
        ) : (
          <PauseIcon className="spotify-player-icon" />
        )}
      </button>
    </div>
  );
};

SpotifyPlayer.propTypes = {
  token: PropTypes.string.isRequired,
  trackUri: PropTypes.string.isRequired,
};

export default SpotifyPlayer;
