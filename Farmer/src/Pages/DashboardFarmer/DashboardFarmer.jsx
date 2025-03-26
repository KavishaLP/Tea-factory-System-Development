import React from "react";
import { FaMoneyBillWave, FaSeedling, FaHistory, FaSignOutAlt, FaHome } from "react-icons/fa";
import "./DashboardFarmer.css";

const DashboardFarmer = () => {
  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2>Welcome, Farmer</h2>
      </div>
      <div className="dashboard-summary">
        <div className="card">
          <FaSeedling className="card-icon" />
          <h3>Total Tea Delivered</h3>
          <p>1200 Kg</p>
        </div>
        <div className="card">
          <FaMoneyBillWave className="card-icon" />
          <h3>Last Payment</h3>
          <p>Rs. 15,000</p>
        </div>
        <div className="card">
          <FaHistory className="card-icon" />
          <h3>Fertilizer Requests</h3>
          <p>Pending: 2</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardFarmer;
