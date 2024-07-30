import React from "react";
import MediaContainer from "./MediaContainer";
import "./Home.css";

const Home = ({ token, setCurrentTrackUri, theme, toggleTheme }) => {
  return (
    <div className={`main-container ${theme}`}>
      <MediaContainer
        token={token}
        setCurrentTrackUri={setCurrentTrackUri}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </div>
  );
};

export default Home;
