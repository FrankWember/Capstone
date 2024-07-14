import React, { useEffect, useState } from "react";
import MediaContainer from "./MediaContainer";
import SideBar from "../SideBar/SideBar";

const Home = ({ token, setCurrentTrackUri }) => {
  return (
    <div>
      <SideBar />
      <MediaContainer token={token} setCurrentTrackUri={setCurrentTrackUri} />
    </div>
  );
};

export default Home;
