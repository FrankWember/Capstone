import React from "react";
import "./pagination.css";

const Pagination = ({ currentSection, totalSections, onPrev, onNext }) => {
  return (
    <div className="pagination-container">
      <button onClick={onPrev} disabled={currentSection === 2}>
        Previous
      </button>
      <span>
        Section {currentSection + 1} of {totalSections}
      </span>
      <button onClick={onNext} disabled={currentSection === totalSections}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
