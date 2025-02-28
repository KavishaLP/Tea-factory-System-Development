import React from "react";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaSeedling, FaHistory, FaSignOutAlt, FaHome } from "react-icons/fa";
import "./FarmerDashboard.css";

const FarmerDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <h2>Farmer Panel</h2>
        <ul>
          <li>
            <Link to="/farmer-home"><FaHome /> Dashboard</Link>
          </li>
          <li>
            <Link to="/payment-history"><FaMoneyBillWave /> Payment History</Link>
          </li>
          <li>
            <Link to="/request-fertilizer"><FaSeedling /> Request Fertilizer</Link>
          </li>
          <li>
            <Link to="/request-advance"><FaHistory /> Request Advance</Link>
          </li>
          <li className="logout">
            <Link to="/logout"><FaSignOutAlt /> Logout</Link>
          </li>
        </ul>
      </nav>

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
