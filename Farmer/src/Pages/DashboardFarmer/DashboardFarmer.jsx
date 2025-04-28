import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaSeedling, FaHistory } from "react-icons/fa";
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
    advances: { 
      pending: { count: 0, amount: 0 }, 
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 }
    },
    fertilizerRequests: { 
      pending: 0, 
      approved: 0,
      rejected: 0 
    }
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentMonth, currentYear, userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      
      const [teaData, paymentData, advanceData, fertilizerData] = await Promise.all([
        fetchTeaDeliveries(userId, monthYear),
        fetchPayments(userId, monthYear),
        fetchAdvances(userId, monthYear),
        fetchFertilizerRequests(userId, monthYear)
      ]);

      setDashboardData({
        teaDeliveries: teaData.data || { total: 0 },
        payments: paymentData.data || { amount: 0 },
        advances: advanceData.data || { 
          pending: { count: 0, amount: 0 }, 
          approved: { count: 0, amount: 0 },
          rejected: { count: 0, amount: 0 }
        },
        fertilizerRequests: fertilizerData.data || { 
          pending: 0, 
          approved: 0,
          rejected: 0 
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

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
      const response = await axios.get("http://localhost:8081/api/farmer/last-payment", {
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
      const response = await axios.get("http://localhost:8081/api/farmer/advances", {
        params: { userId, monthYear }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching advances:", error);
      return { data: { 
        pending: { count: 0, amount: 0 }, 
        approved: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 }
      } };
    }
  };

  const fetchFertilizerRequests = async (userId, monthYear) => {
    try {
      const response = await axios.get("http://localhost:8081/api/farmer/fertilizer-requests", {
        params: { userId, monthYear }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching fertilizer requests:", error);
      return { data: { pending: 0, approved: 0, rejected: 0 } };
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
          {/* Row 1 */}
          <div className="dashboard-row">
            <div className="dashboard-card">
              <FaSeedling className="card-icon" />
              <h3>Tea Delivered</h3>
              <p className="card-value">{formatNumber(dashboardData.teaDeliveries.total)} Kg</p>
              <p className="card-description">Total tea delivered this month</p>
            </div>

            <div className="dashboard-card">
              <FaMoneyBillWave className="card-icon" />
              <h3>Last Payment</h3>
              <p className="card-value">Rs. {formatNumber(dashboardData.payments.amount)}</p>
              <p className="card-description">Most recent approved payment</p>
            </div>
          </div>

          {/* Row 2 - Advances */}
          <div className="dashboard-card full-width">
            <FaMoneyBillWave className="card-icon" />
            <h3>Advances Summary</h3>
            <div className="status-grid">
              <div className="status-card pending">
                <h4>Pending</h4>
                <p className="status-count">{dashboardData.advances.pending.count}</p>
                <p className="status-amount">Rs. {formatNumber(dashboardData.advances.pending.amount)}</p>
              </div>
              <div className="status-card approved">
                <h4>Approved</h4>
                <p className="status-count">{dashboardData.advances.approved.count}</p>
                <p className="status-amount">Rs. {formatNumber(dashboardData.advances.approved.amount)}</p>
              </div>
              <div className="status-card rejected">
                <h4>Rejected</h4>
                <p className="status-count">{dashboardData.advances.rejected.count}</p>
                <p className="status-amount">Rs. {formatNumber(dashboardData.advances.rejected.amount)}</p>
              </div>
            </div>
          </div>

          {/* Row 3 - Fertilizer Requests */}
          <div className="dashboard-card full-width">
            <FaHistory className="card-icon" />
            <h3>Fertilizer Requests</h3>
            <div className="status-grid">
              <div className="status-card pending">
                <h4>Pending</h4>
                <p className="status-count">{dashboardData.fertilizerRequests.pending}</p>
              </div>
              <div className="status-card approved">
                <h4>Approved</h4>
                <p className="status-count">{dashboardData.fertilizerRequests.approved}</p>
              </div>
              <div className="status-card rejected">
                <h4>Rejected</h4>
                <p className="status-count">{dashboardData.fertilizerRequests.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFarmer;