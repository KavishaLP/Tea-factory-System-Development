/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="cfa-content">
      <h2>Dashboard</h2>
      <div className="cfa-grid">
        <div className="stats-container">
          <div className="stats-card">
            <div className="stats-icon">📦</div>
            <div className="stats-content">
              <p>Revenue</p>
              <h3>30,000</h3>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">💸</div>
            <div className="stats-content">
              <p>Sales Return</p>
              <h3>30,000</h3>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">🛒</div>
            <div className="stats-content">
              <p>Purchase</p>
              <h3>30,000</h3>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">💰</div>
            <div className="stats-content">
              <p>Income</p>
              <h3>30,000</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;