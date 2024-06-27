import react from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "boxicons";
import Trending from "../Screens/Trending/Trending";
import Favorite from "../Screens/Favorites/Favorites";
import Player from "../Screens/Player/Player";
import Registration from "../Screens/Registration/Registration";
import SideBar from "../SideBar/SideBar";
import Library from "../Screens/Library/Library";
import Login from "../Screens/Login/Login";
import "./Home.css";
function Home() {
  return (
    <>
      <div>
        <Router>
          <div className="main-body">
            <SideBar />

            <Routes>
              <Route path="/library" element={<Library />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/favorite" element={<Favorite />} />
              <Route path="/player" element={<Player />} />
            </Routes>
          </div>
        </Router>
      </div>
    </>
  );
}
export default Home;
