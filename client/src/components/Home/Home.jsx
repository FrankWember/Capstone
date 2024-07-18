import React, { useEffect, useState } from "react";
import MediaContainer from "./MediaContainer";
import "./Home.css";
const Home = ({ token, setCurrentTrackUri }) => {
  return (
    <div className="main-contianer">
      <MediaContainer token={token} setCurrentTrackUri={setCurrentTrackUri} />
    </div>
  );
};

export default Home;
