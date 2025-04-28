import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import "./DashboardAdmin.css";

const DashboardAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, requestsRes] = await Promise.all([
          axios.get("http://localhost:8081/api/admin/fetch-total-users", { withCredentials: true }),
          axios.get("http://localhost:8081/api/admin/fetch-pending-requests", { withCredentials: true })
        ]);
        
        setTotalUsers(usersRes.data.totalUsers);
        setPendingRequests(requestsRes.data.count);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">System Overview</p>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div className="metrics-container">
          <div className="metric-card">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>Total Users</h3>
              <p className="card-value">{totalUsers}</p>
              <p className="card-description">Registered accounts</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="card-icon">
              <FaMoneyBillWave />
            </div>
            <div className="card-content">
              <h3>Pending Requests</h3>
              <p className="card-value">{pendingRequests}</p>
              <p className="card-description">Awaiting approval</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;