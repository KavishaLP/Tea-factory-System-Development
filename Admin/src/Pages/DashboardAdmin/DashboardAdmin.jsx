import React from "react";
import "./DashboardAdmin.css";

const DashboardAdmin = () => {
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <ul>
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Users</a></li>
          <li><a href="#">Payments</a></li>
          <li><a href="#">Settings</a></li>
        </ul>
      </div>

      <div className="main-content">
        <h1>Welcome to the Admin Dashboard</h1>
        <div className="cards">
          <div className="card">
            <h2>Total Users</h2>
            <p>150</p>
          </div>
          <div className="card">
            <h2>Total Payments</h2>
            <p>$5,000</p>
          </div>
          <div className="card">
            <h2>Pending Requests</h2>
            <p>3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
