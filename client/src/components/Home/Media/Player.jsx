import React, { useState, useEffect } from "react";
import SpotifyWebPlayer from "spotify-web-playback-sdk";

const Player = ({ accessToken, track }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!accessToken || !track) return;

    const initializePlayer = () => {
      const playerInstance = new SpotifyWebPlayer.Player({
        name: "Your App Name",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
      });

      playerInstance.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        playTrack(device_id);
      });

      playerInstance.addListener("player_state_changed", (state) => {
        console.log("Current Track: ", state.track_window.current_track);
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };

    initializePlayer();

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, track]);

  const playTrack = (deviceId) => {
    if (player) {
      player.setVolume(0.5); // Example: Set volume to 50%
      player
        .play({
          uris: [`spotify:track:${track.id}`],
          deviceId: deviceId,
        })
        .then(() => {
          setIsPlaying(true);
        });
    }
  };

  const pauseTrack = () => {
    if (player) {
      player.pause().then(() => {
        setIsPlaying(false);
      });
    }
  };

  const stopTrack = () => {
    if (player) {
      player.pause().then(() => {
        setIsPlaying(false);
        player.seek(0).then(() => {});
      });
    }
  };

  return (
    <div className="player">
      <h3>Music Player</h3>
      <p>
        Now Playing: {track.name} by{" "}
        {track.artists.map((artist) => artist.name).join(", ")}
      </p>
      <button onClick={isPlaying ? pauseTrack : () => playTrack()}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button onClick={stopTrack}>Stop</button>
    </div>
  );
};

export default Player;
