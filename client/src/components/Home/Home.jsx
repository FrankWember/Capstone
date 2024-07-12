import React, { useEffect, useState } from "react";
import MediaContainer from "./MediaContainer";

const Home = ({ token }) => {
  return (
    <div>
      <MediaContainer token={token} />
    </div>
  );
};

export default Home;
