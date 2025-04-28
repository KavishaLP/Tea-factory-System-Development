import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaSeedling, FaHistory, FaTimes } from "react-icons/fa";
import axios from "axios";
import "./DashboardFarmer.css";

const DashboardFarmer = ({ userId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    teaDeliveries: { total: 0 },
    payments: { amount: 0 },
    advances: { pending: { count: 0, amount: 0 }, approved: { count: 0, amount: 0 } },
    fertilizerRequests: { pending: 0, approved: 0 }
  });

  // Helper function to safely format numbers
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [currentMonth, currentYear, userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      
      // Fetch all dashboard data in parallel
      const [teaData, paymentData, advanceData, fertilizerData] = await Promise.all([
        fetchTeaDeliveries(userId, monthYear),
        fetchPayments(userId, monthYear),
        fetchAdvances(userId, monthYear),
        fetchFertilizerRequests(userId, monthYear)
      ]);

      setDashboardData({
        teaDeliveries: teaData.data || { total: 0 },
        payments: paymentData.data || { amount: 0 },
        advances: advanceData.data || { pending: { count: 0, amount: 0 }, approved: { count: 0, amount: 0 } },
        fertilizerRequests: fertilizerData.data || { pending: 0, approved: 0 }
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  // API call functions
  const fetchTeaDeliveries = async (userId, monthYear) => {
    try {
      const response = await axios.get("http://localhost:8081/api/farmer/tea-deliveries", {
        params: { userId, monthYear }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tea deliveries:", error);
      return { data: { total: 0 } };
    }
  };

  const fetchPayments = async (userId, monthYear) => {
    try {
      const response = await axios.get("/api/farmer/last-payment", {
        params: { userId, monthYear }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      return { data: { amount: 0 } };
    }
  };

  const fetchAdvances = async (userId, monthYear) => {
    try {
      const response = await axios.get("/api/farmer/advances", {
        params: { userId, monthYear }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching advances:", error);
      return { data: { pending: { count: 0, amount: 0 }, approved: { count: 0, amount: 0 } } };
    }
  };

  const fetchFertilizerRequests = async (userId, monthYear) => {
    try {
      const response = await axios.get("/api/farmer/fertilizer-requests", {
        params: { userId, monthYear }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching fertilizer requests:", error);
      return { data: { pending: 0, approved: 0 } };
    }
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      // Don't allow navigation to future months
      const now = new Date();
      if (currentYear < now.getFullYear() || 
          (currentYear === now.getFullYear() && currentMonth < now.getMonth() + 1)) {
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }
      }
    }
  };

  const handleFertilizerAction = async (action, requestId) => {
    try {
      await axios.put(`/api/farmer/fertilizer-requests/${requestId}`, { action });
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action} fertilizer request:`, error);
      setError(`Failed to ${action} fertilizer request. Please try again.`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2>Welcome, {userId}</h2>
        <div className="month-navigation">
          <button onClick={() => navigateMonth("prev")}>{"<"} Previous</button>
          <h3>
            {monthNames[currentMonth - 1]} {currentYear}
          </h3>
          <button
            onClick={() => navigateMonth("next")}
            disabled={
              new Date(currentYear, currentMonth) >=
              new Date(new Date().getFullYear(), new Date().getMonth() + 1)
            }
          >
            Next {">"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          Loading Dashboard...
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* First Row */}
          <div className="dashboard-row">
            {/* Updated Tea Delivered card */}
            <div className="dashboard-card">
              <FaSeedling className="card-icon" />
              <h3>Tea Delivered</h3>
              <p>{formatNumber(dashboardData.teaDeliveries.total)} Kg</p>
            </div>

            {/* Updated Last Payment card */}
            <div className="dashboard-card">
              <FaMoneyBillWave className="card-icon" />
              <h3>Last Payment</h3>
              <p>Rs. {formatNumber(dashboardData.payments.amount)}</p>
            </div>

            {/* Updated Advances card */}
            <div className="dashboard-card full-width">
              <FaMoneyBillWave className="card-icon" />
              <h3>Advances</h3>
              <div className="advance-details">
                <div className="advance-item">
                  <span className="advance-label">Pending:</span>
                  <span className="advance-value">
                    {dashboardData.advances.pending.count} (Rs. {formatNumber(dashboardData.advances.pending.amount)})
                  </span>
                </div>
                <div className="advance-item">
                  <span className="advance-label">Approved:</span>
                  <span className="advance-value">
                    {dashboardData.advances.approved.count} (Rs. {formatNumber(dashboardData.advances.approved.amount)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Third Row - Fertilizer Requests with Actions */}
          <div className="dashboard-card full-width">
            <FaHistory className="card-icon" />
            <h3>Fertilizer Requests</h3>
            <div className="fertilizer-details">
              <div className="fertilizer-stats">
                <span className="fertilizer-label">Pending:</span>
                <span className="fertilizer-value">{dashboardData.fertilizerRequests.pending}</span>
                
                <span className="fertilizer-label">Approved:</span>
                <span className="fertilizer-value">{dashboardData.fertilizerRequests.approved}</span>
              </div>
              
              <div className="fertilizer-actions">
                <button 
                  className="action-btn approve"
                  onClick={() => handleFertilizerAction('approve', 'sample-id')}
                >
                  Approve
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleFertilizerAction('delete', 'sample-id')}
                >
                  Delete
                </button>
                <button 
                  className="action-btn reject"
                  onClick={() => handleFertilizerAction('reject', 'sample-id')}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFarmer;