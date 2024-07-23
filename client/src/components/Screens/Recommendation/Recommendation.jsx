import React, { useEffect, useState } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";
import SideBar from "../../SideBar/SideBar";
import "./Recommendation.css";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.749933,
  lng: -73.98633,
};

const libraries = ["places"];

const Recommendation = ({ onLocationUpdate }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBBv8sZWRTNpE5qIE9Y0jPvjMHXIAnNw70",
    libraries,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [weather, setWeather] = useState(null);
  const [placeTypes, setPlaceTypes] = useState([]);
  const [bgColor, setBgColor] = useState("#27303f");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchWeatherData = async (lat, lon) => {
    const apiKey = "5de13611132ea8b25abcbcec9f74d951";
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setWeather(data);
      setBgColor(getBackgroundColor(data.main.temp));
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  };

  const getAddress = async (lat, lng) => {
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBBv8sZWRTNpE5qIE9Y0jPvjMHXIAnNw70`;
    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      } else {
        console.error("No address found for the given location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const fetchPlaceTypes = (lat, lng) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: "10",
    };

    service.nearbySearch(request, (results, status) => {
      console.log(results);
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const primaryTypes = results.map((place) => place.types[0]);
        setPlaceTypes(primaryTypes);
      } else {
        console.error("Error fetching place types:", status);
      }
    });
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (typeof onLocationUpdate === "function") {
            onLocationUpdate(location);
          }
          getAddress(location.lat, location.lng);
          fetchWeatherData(location.lat, location.lng);
          fetchPlaceTypes(location.lat, location.lng);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting the current location: ", error);
          setLoading(false);
        }
      );
    }
  };

  const saveRecommendation = async () => {
    const userId = localStorage.getItem("userId");
    const recommendationData = {
      user_id: userId,
      location: address,
      weather: weather
        ? `${weather.main.temp}°C, ${weather.weather[0].description}`
        : "",
      place_types: placeTypes.join(", "),
    };

    try {
      setSaving(true);
      await axios.post(
        "http://localhost:3000/save-recommendation",
        recommendationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Recommendation saved successfully");
      setSaving(false);
    } catch (error) {
      console.error("Failed to save recommendation:", error);
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  const customIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: new window.google.maps.Size(50, 50),
  };

  const getWeatherIconUrl = (icon) => {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  const getBackgroundColor = (temp) => {
    if (temp <= 22) return "#a2cffe";
    if (temp <= 25) return "#ffd56b";
    if (temp <= 30) return "#ff9442";
    return "#f94e10";
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div
        className="recommendation-container"
        style={{ backgroundColor: bgColor }}
      >
        <button
          className="get-location-button"
          onClick={fetchCurrentLocation}
          disabled={loading}
        >
          {loading ? "Fetching Location..." : "Get Current Location"}
        </button>
        <button
          className="save-recommendation-button"
          onClick={() => saveRecommendation()}
          style={{ backgroundColor: "blue" }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Recommendation"}
        </button>
        <div className="content">
          <div className="info-container">
            {weather && (
              <div
                className="weather-info"
                style={{ backgroundColor: bgColor }}
              >
                <h3>Current Weather</h3>
                <span>Live</span>
                <img
                  src={getWeatherIconUrl(weather.weather[0].icon)}
                  alt="Weather Icon"
                />
                <p>{weather.name}</p>
                <p>{weather.weather[0].description}</p>
                <p>{weather.main.temp}°C</p>
              </div>
            )}
            {address && (
              <div
                className="address-info"
                style={{ backgroundColor: bgColor }}
              >
                <h3>Your Location</h3>
                <p>{address}</p>
                <p>Place Types: {placeTypes.join(", ")}</p>
              </div>
            )}
          </div>
          <div className="map-container">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={17}
              center={currentLocation || defaultCenter}
            >
              {currentLocation && (
                <Marker position={currentLocation} icon={customIcon} />
              )}
            </GoogleMap>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
