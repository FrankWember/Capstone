import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  PlayIcon,
  PauseIcon,
  FastForwardIcon,
  RewindIcon,
  VolumeUpIcon,
  PlusIcon,
  XIcon,
} from "@heroicons/react/solid";
import "./SpotifyPlayer.css";

const SpotifyPlayer = ({ token, trackUri, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [volume, setVolume] = useState(50);
  const [trackInfo, setTrackInfo] = useState({});
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [showPlaylists, setShowPlaylists] = useState(false);

  useEffect(() => {
    const initializePlayer = () => {
      const player = new window.Spotify.Player({
        name: "MoodTune Player",
        getOAuthToken: (cb) => {
          cb(token);
        },
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

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

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setIsPaused(state.paused);
        setTrackInfo({
          name: state.track_window.current_track.name,
          artist: state.track_window.current_track.artists
            .map((artist) => artist.name)
            .join(", "),
          album: state.track_window.current_track.album.name,
          image: state.track_window.current_track.album.images[0].url,
        });
        setProgress(state.position);
        setDuration(state.duration);

        if (!state.paused && !intervalId) {
          const id = setInterval(() => {
            setProgress((prevProgress) => prevProgress + 1000);
          }, 1000);
          setIntervalId(id);
        } else if (state.paused && intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      });

      player.connect();
    };

    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (player) {
        player.disconnect();
      }
    };
  }, [token, intervalId]);

  useEffect(() => {
    if (player && trackUri) {
      play({ spotify_uri: trackUri, playerInstance: player });
    }
  }, [trackUri]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`https://api.spotify.com/v1/me/playlists`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setPlaylists(data.items);
      } catch (error) {
        console.error("Error fetching playlists", error);
      }
    };

    fetchPlaylists();
  }, [token]);

  const play = ({
    spotify_uri,
    playerInstance: {
      _options: { getOAuthToken, id },
    },
  }) => {
    getOAuthToken((access_token) => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });
    });
  };

  const handlePlayPause = () => {
    if (!deviceId) {
      console.error("Device ID is not set");
      return;
    }
    if (isPaused) {
      play({ playerInstance: player, spotify_uri: trackUri });
    } else {
      player.pause();
    }
  };

  const handleNextTrack = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const handlePreviousTrack = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };

  const handlePlaylistSelection = (playlistId) => {
    setSelectedPlaylists((prevSelected) =>
      prevSelected.includes(playlistId)
        ? prevSelected.filter((id) => id !== playlistId)
        : [...prevSelected, playlistId]
    );
  };

  const handleAddToPlaylists = () => {
    if (!trackUri || selectedPlaylists.length === 0) return;

    selectedPlaylists.forEach((playlistId) => {
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      })
        .then((response) => {
          if (response.ok) {
            console.log(`Track added to playlist ${playlistId}`);
          } else {
            console.error(`Error adding track to playlist ${playlistId}`);
          }
        })
        .catch((error) => {
          console.error(`Error adding track to playlist ${playlistId}`, error);
        });
    });
    setShowPlaylists(false);
  };

  const handleProgressChange = (e) => {
    const newPosition = e.target.value;
    setProgress(newPosition);
    if (player) {
      player.seek(newPosition);
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return seconds == 60
      ? minutes + 1 + ":00"
      : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  return (
    <div className="spotify-player">
      <div className="spotify-player-info">
        {trackInfo.image && <img src={trackInfo.image} alt="Album cover" />}
        <div className="player-track-container">
          <div className="player-track-details">
            <p className="marquee player-track-name">{trackInfo.name}</p>
            <p className="player-track-artist">{trackInfo.artist}</p>
            <p className="player-track-album">{trackInfo.album}</p>
          </div>
        </div>
      </div>
      <div className="playlist-dropdown-container">
        <button
          onClick={() => setShowPlaylists(!showPlaylists)}
          className="spotify-player-button"
        >
          <PlusIcon className="spotify-player-icon" />
        </button>
        {showPlaylists && (
          <div className="playlist-dropdown">
            <div className="playlist-dropdown-header">Select Playlists</div>
            {playlists.map((playlist) => (
              <label key={playlist.id} className="playlist-item">
                {playlist.images[0] && (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="playlist-item-image"
                  />
                )}
                <div className="playlist-item-info">
                  <p className="playlist-item-name">{playlist.name}</p>
                  <p className="playlist-item-tracks">
                    {playlist.tracks.total} songs
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="playlist"
                  value={playlist.id}
                  checked={selectedPlaylists.includes(playlist.id)}
                  onChange={() => handlePlaylistSelection(playlist.id)}
                  className="playlist-checkbox"
                />
              </label>
            ))}
            <button
              onClick={handleAddToPlaylists}
              className="save-playlists-button"
            >
              Save to Selected Playlists
            </button>
          </div>
        )}
      </div>
      <div className="spotify-player-controls">
        <button onClick={handlePreviousTrack} className="spotify-player-button">
          <RewindIcon className="spotify-player-icon" />
        </button>
        <button onClick={handlePlayPause} className="spotify-player-button">
          {isPaused ? (
            <PlayIcon className="spotify-player-icon" />
          ) : (
            <PauseIcon className="spotify-player-icon" />
          )}
        </button>
        <button onClick={handleNextTrack} className="spotify-player-button">
          <FastForwardIcon className="spotify-player-icon" />
        </button>
      </div>
      <div className="spotify-player-progress">
        <div className="progress-time">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={handleProgressChange}
            className="progress-bar"
          />
          <span>{formatTime(duration - progress)}</span>
        </div>
      </div>
      <div className="spotify-player-volume">
        <VolumeUpIcon className="spotify-player-icon" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-bar"
        />
      </div>
      <button onClick={onClose} className="spotify-player-close-button">
        <XIcon className="spotify-player-icon" />
      </button>
    </div>
  );
};

SpotifyPlayer.propTypes = {
  token: PropTypes.string.isRequired,
  trackUri: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SpotifyPlayer;
