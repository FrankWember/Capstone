import React from "react";
import "./Home.css";
import SideBar from "../SideBar/SideBar";
import MediaContainer from "./MediaContainer";
import RecommendationBar from "../RecommendationBar/RecommendationBar";

<<<<<<< HEAD
const Home = () => {
=======
function Home() {
  //Ask help tommorow
>>>>>>> 4c9c18289718400dabb30d4b0b2f353e2882e4b2
  return (
    <div className="d-flex">
      {/* d-flex makes the container a flexbox container */}
      {/* I want the SideBar the MediaContainer and the RecommendationFactors to appear in a flex manner */}

      <SideBar />

      {/* <MediaContainer /> */}

      {/* <RecommendationFactor /> */}
      <RecommendationBar />
    </div>
  );
};

export default Home;
