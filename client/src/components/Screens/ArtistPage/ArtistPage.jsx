import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ArtistPage.css";
import SideBar from "../../SideBar/SideBar";
import SpotifyCard from "../../Home/Media/SpotifyCard";
import { ArrowLeftIcon } from "@heroicons/react/solid";

const ArtistPage = ({ token, setCurrentTrackUri }) => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artistDetails, setArtistDetails] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
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

  useEffect(() => {
    const getArtistDetails = async () => {
      const details = await fetchWebApi(`v1/artists/${artistId}`);
      const tracks = await fetchWebApi(
        `v1/artists/${artistId}/top-tracks?market=US`
      );
      const albums = await fetchWebApi(
        `v1/artists/${artistId}/albums?market=US&limit=15`
      );
      const related = await fetchWebApi(
        `v1/artists/${artistId}/related-artists?limit=15`
      );
      if (details && tracks && albums && related) {
        setArtistDetails(details);
        setTopTracks(tracks.tracks);
        setAlbums(albums.items);
        setRelatedArtists(related.artists);
      }
    };

    if (token && artistId) {
      getArtistDetails();
    }
  }, [token, artistId]);

  const handlePlayTrack = (trackUri) => {
    setCurrentTrackUri(trackUri);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="artist-page">
      <SideBar />
      <div className="artist-content">
        {artistDetails && (
          <div className="artist-header">
            <button className="back-button" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="back-icon" />
              Back
            </button>
            <img
              src={artistDetails.images[0].url}
              alt={artistDetails.name}
              className="artist-image"
            />
            <div className="artist-info">
              <h1 className="artist-name">{artistDetails.name}</h1>
              <p className="artist-followers">
                {artistDetails.followers.total.toLocaleString()} followers
              </p>
              <p className="artist-genres">{artistDetails.genres.join(", ")}</p>
            </div>
          </div>
        )}
        <div className="top-tracks">
          <h2>Top Tracks</h2>
          <table className="tracks-table">
            <thead>
              <tr>
                <th className="table-header">#</th>
                <th className="table-header">Title</th>
                <th className="table-header">Album</th>
                <th className="table-header">Duration</th>
              </tr>
            </thead>
            <tbody>
              {topTracks.map((track, index) => (
                <tr
                  key={track.id}
                  className="track-row"
                  onClick={() => handlePlayTrack(track.uri)}
                >
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell track-title">
                    <div className="track-info">
                      <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="track-cover"
                      />
                      <div className="track-details">
                        <span className="track-name">{track.name}</span>
                        <span className="track-artists">
                          {track.artists
                            .map((artist) => artist.name)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{track.album.name}</td>
                  <td className="table-cell">
                    {formatDuration(track.duration_ms)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="albums">
          <h2>Albums</h2>
          <div className="gridItem">
            {albums.map((album) => (
              <SpotifyCard
                key={album.id}
                item={album}
                token={token}
                type="album"
                onClick={() => navigate(`/album/${album.id}`)}
              />
            ))}
          </div>
        </div>
        <div className="related-artists">
          <h2>Related Artists</h2>
          <div className="gridItem">
            {relatedArtists.map((artist) => (
              <SpotifyCard
                key={artist.id}
                item={artist}
                token={token}
                type="artist"
                onClick={() => navigate(`/artist/${artist.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
