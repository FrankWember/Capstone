import React from "react";
import "./Home.css";
import SideBar from "../SideBar/SideBar";
import MediaContainer from "./MediaContainer";
import RecommendationBar from "../RecommendationBar/RecommendationBar";

const Home = ({ token }) => {
  return (
    <div className="d-flex">
      <SideBar />
      <div className="main-content">
        <MediaContainer token={token} /> {/* Pass the token as a prop */}
      </div>
      <div>
        <RecommendationBar />
      </div>
    </div>
  );
};

export default Home;
