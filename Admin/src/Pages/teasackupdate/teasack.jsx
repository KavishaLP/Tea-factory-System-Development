import React from 'react';
import './teasack.css';

function TeaSackUpdate() {
  return (
    <div className="tea-sack-container">
      
      <div className="content">
        <div className="search-bar">
          <label htmlFor="searchUserId">Search User Id Here</label>
          <input type="text" id="searchUserId" placeholder="Search User Id Here" />
        </div>
        <form className="tea-sack-form">
          <label>User Id</label>
          <input type="text" placeholder="User Id" />

          <label>Date</label>
          <input type="date" />

          <label>Tea Sack Weight</label>
          <input type="text" placeholder="Tea Sack Weight" />

          <div className="deduction-section">
            <label>Deduction</label>
            <div className="deduction-fields">
              <div>
                <span>For water :</span>
                <input type="text" />
              </div>
              <div>
                <span>For damage tea Leaves :</span>
                <input type="text" />
              </div>
              <div>
                <span>For sack weight :</span>
                <input type="text" />
              </div>
              <div>
                <span>For tea packets :</span>
                <input type="text" />
              </div>
              <div>
                <span>For water :</span>
                <input type="text" />
              </div>
            </div>
          </div>

          <div className="fertilizer-amount">
              <label>Total Fertilizer Amount:</label>
              <input type="text" placeholder="Enter amount" />
           </div>

          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
      
    </div>
  );
}

export default TeaSackUpdate;
