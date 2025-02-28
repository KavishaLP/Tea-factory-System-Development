import React from "react";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaSeedling, FaHistory, FaSignOutAlt, FaHome } from "react-icons/fa";
import "./DashboardFarmer.css";

const FarmerDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
    

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome, Farmer</h1>
        <div className="dashboard-summary">
          <div className="card">
            <h3>Total Tea Delivered</h3>
            <p>1200 Kg</p>
          </div>
          <div className="card">
            <h3>Last Payment</h3>
            <p>Rs. 15,000</p>
          </div>
          <div className="card">
            <h3>Fertilizer Requests</h3>
            <p>Pending: 2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
