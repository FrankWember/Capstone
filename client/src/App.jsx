// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { RouterConfig } from "../src/components/Router/RouteConfig";
import "./App.css";

const App = () => {
  return (
    <>
      <Router>
        {/* The flex-grow-1 class makes the element grow to fill 
      any available space in its flex container.
      The p-3 class applies padding to all sides of the element.
      make the element both flexible and padded: */}

        <div className="flex-grow-1 p-3">
          {/* Stored all the elements in the Router config for modularity
     and ease to change it to will without modifying Home */}
          <RouterConfig />
        </div>
      </Router>
    </>
  );
};

export default App;
