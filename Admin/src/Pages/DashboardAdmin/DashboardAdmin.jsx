import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaMoneyBillWave, FaClock } from 'react-icons/fa';

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
    <div className="admin-dashboard">
      <div className="sidebar">
        {/* Your sidebar content */}
      </div>
      
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">Overview and quick actions</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card user-card">
              <div className="card-icon">
                <FaUsers size={28} />
              </div>
              <div className="card-content">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
                <p className="stat-description">Registered in system</p>
              </div>
            </div>
            
            <div className="stat-card advance-card">
              <div className="card-icon">
                <FaMoneyBillWave size={28} />
              </div>
              <div className="card-content">
                <h3>Pending Advances</h3>
                <p className="stat-value">{stats.pendingAdvances}</p>
                <p className="stat-description">Requiring approval</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;