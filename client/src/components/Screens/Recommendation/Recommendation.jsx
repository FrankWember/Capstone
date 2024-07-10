import React, { useEffect, useState } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import SideBar from "../../SideBar/SideBar";
import "./Recommendation.css"; // Import the CSS file

const mapContainerStyle = {
  width: "100%", // Full width of the container
  height: "100%", // Full height of the container
};

const defaultCenter = {
  lat: 40.749933,
  lng: -73.98633,
};

const libraries = ["places"]; // Static array of libraries

const Recommendation = ({ onLocationUpdate }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBBv8sZWRTNpE5qIE9Y0jPvjMHXIAnNw70",
    libraries,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [weather, setWeather] = useState(null);
  const [placeTypes, setPlaceTypes] = useState([]);
  const [bgColor, setBgColor] = useState("#f5f5f5");

  // Function to fetch weather data from OpenWeatherMap API
  const fetchWeatherData = async (lat, lon) => {
    const apiKey = "5de13611132ea8b25abcbcec9f74d951";
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      console.log(data); // Log the weather data for debugging purposes
      setWeather(data); // Set the fetched weather data to the state
      setBgColor(getBackgroundColor(data.main.temp)); // Set the background color based on temperature
    } catch (error) {
      console.error("Failed to fetch weather data:", error); // Log any errors that occur during the fetch
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
      radius: "10", // Search within 5 meters
    };

    service.nearbySearch(request, (results, status) => {
      console.log(results);
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const types = results.map((place) => place.types).flat();
        setPlaceTypes(types);
      } else {
        console.error("Error fetching place types:", status);
      }
    });
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
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
          fetchWeatherData(location.lat, location.lng); // Fetch weather data for the current location
          fetchPlaceTypes(location.lat, location.lng); // Fetch place types for the current location
        },
        (error) => {
          console.error("Error getting the current location: ", error);
        }
      );
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  // Custom icon for the marker
  const customIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // URL to the custom marker image
    scaledSize: new window.google.maps.Size(50, 50), // Adjust the size as needed
  };

  // Function to get the weather icon URL based on weather data
  const getWeatherIconUrl = (icon) => {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  // Function to get background color based on temperature
  const getBackgroundColor = (temp) => {
    if (temp <= 20) return "#a2cffe"; // Very cold temperatures (light blue)
    if (temp <= 25) return "#ffd56b"; // Warm temperatures (light yellow)
    if (temp <= 30) return "#ff9442"; // Hot temperatures (orange)
    return "#f94e10"; // Very hot temperatures (red-orange)
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div
        className="recommendation-container"
        style={{ backgroundColor: bgColor }}
      >
        <button className="get-location-button" onClick={fetchCurrentLocation}>
          Get Current Location
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
