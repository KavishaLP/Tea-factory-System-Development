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
        // Replace with your actual API endpoints
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
        <h1>Admin Dashboard</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="card-icon">
                <FaUsers size={32} />
              </div>
              <div className="card-content">
                <h3>Total Users</h3>
                <p>{stats.totalUsers}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="card-icon">
                <FaMoneyBillWave size={32} />
              </div>
              <div className="card-content">
                <h3>Pending Advances</h3>
                <p>{stats.pendingAdvances}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;