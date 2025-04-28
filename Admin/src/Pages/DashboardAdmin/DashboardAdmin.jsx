import React, { useEffect, useState } from "react";
import "./DashboardAdmin.css";
import Navbar from '../../Component/Navbar/Navbar2';
import Sidebar from '../../Component/sidebar/sidebar2';
import axios from "axios";
import { FaUsers, FaClock, FaMoneyBillWave } from 'react-icons/fa';

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
    <div className="admin-dashboard">      
      <div className="main-content">
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
          <div className="metrics-grid">
            <div className="metric-card users-card">
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <h3>Total Users</h3>
                <p className="metric-value">{totalUsers}</p>
                <p className="metric-description">Registered accounts</p>
              </div>
            </div>
            
            <div className="metric-card requests-card">
              <div className="metric-icon">
                <FaMoneyBillWave />
              </div>
              <div className="metric-content">
                <h3>Pending Requests</h3>
                <p className="metric-value">{pendingRequests}</p>
                <p className="metric-description">Awaiting approval</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;