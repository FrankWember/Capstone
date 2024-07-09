import React, { useEffect, useState } from "react";
import MediaContainer from "./MediaContainer";

const Home = ({ token, userLocation, setUserLocation }) => {
  const [weather, setWeather] = useState(null);

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
    } catch (error) {
      console.error("Failed to fetch weather data:", error); // Log any errors that occur during the fetch
    }
  };

  // Use useEffect to fetch weather data when userLocation changes
  useEffect(() => {
    if (userLocation) {
      fetchWeatherData(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  return (
    <div>
      <MediaContainer token={token} weather={weather} />
    </div>
  );
};

export default Home;
