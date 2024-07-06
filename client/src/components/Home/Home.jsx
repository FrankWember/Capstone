import React, { useState } from "react";
import "./Home.css";
import SideBar from "../SideBar/SideBar";
import MediaContainer from "./MediaContainer";
const Home = ({ token }) => {
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <div className="d-flex flex-column min-h-screen">
      <SideBar token={token} />
      <MediaContainer token={token} playTrack={setCurrentTrack} />
    </div>
  );
};

export default Home;
