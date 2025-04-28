import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaMoneyBillWave } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingAdvances: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, advancesRes] = await Promise.all([
          axios.get('http://localhost:8081/api/admin/total-users'),
          axios.get('http://localhost:8081/api/admin/pending-advances')
        ]);
        
        setStats({
          totalUsers: usersRes.data.count || 0,
          pendingAdvances: advancesRes.data.count || 0
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        {/* Your sidebar content */}
      </div>
      
      <div className="admin-main-content">
        <div className="dashboard-title-section">
          <h1 className="dashboard-main-title">Admin Dashboard</h1>
          <p className="dashboard-sub-title">Overview and quick actions</p>
        </div>
        
        {error && <div className="dashboard-error-alert">{error}</div>}
        
        {loading ? (
          <div className="dashboard-loading-state">
            <div className="loading-spinner-animation"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="metrics-card-grid">
            <div className="metric-card users-metric">
              <div className="metric-icon-wrapper">
                <FaUsers className="metric-icon" />
              </div>
              <div className="metric-content">
                <h3 className="metric-title">Total Users</h3>
                <p className="metric-value">{stats.totalUsers}</p>
                <p className="metric-description">Registered in system</p>
              </div>
            </div>
            
            <div className="metric-card advances-metric">
              <div className="metric-icon-wrapper">
                <FaMoneyBillWave className="metric-icon" />
              </div>
              <div className="metric-content">
                <h3 className="metric-title">Pending Advances</h3>
                <p className="metric-value">{stats.pendingAdvances}</p>
                <p className="metric-description">Requiring approval</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;