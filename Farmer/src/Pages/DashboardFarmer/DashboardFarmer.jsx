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
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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

  // Fetch summary data functions
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

  // Fetch detailed data functions
  const fetchTeaDeliveryDetails = async () => {
    try {
      setModalLoading(true);
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const response = await axios.get("http://localhost:8081/api/farmer/tea-delivery-details", {
        params: { userId, monthYear }
      });
      setModalData(response.data);
      setActiveModal('tea');
    } catch (error) {
      console.error("Error fetching tea delivery details:", error);
      setError("Failed to load tea delivery details.");
    } finally {
      setModalLoading(false);
    }
  };

  const fetchAdvanceDetails = async () => {
    try {
      setModalLoading(true);
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const response = await axios.get("http://localhost:8081/api/farmer/advance-details", {
        params: { userId, monthYear }
      });
      setModalData(response.data);
      setActiveModal('advances');
    } catch (error) {
      console.error("Error fetching advance details:", error);
      setError("Failed to load advance details.");
    } finally {
      setModalLoading(false);
    }
  };

  const fetchFertilizerDetails = async () => {
    try {
      setModalLoading(true);
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const response = await axios.get("http://localhost:8081/api/farmer/fertilizer-request-details", {
        params: { userId, monthYear }
      });
      setModalData(response.data);
      setActiveModal('fertilizer');
    } catch (error) {
      console.error("Error fetching fertilizer details:", error);
      setError("Failed to load fertilizer request details.");
    } finally {
      setModalLoading(false);
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

  const closeModal = () => {
    setActiveModal(null);
    setModalData([]);
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
            <div className="dashboard-card clickable" onClick={fetchTeaDeliveryDetails}>
              <FaSeedling className="card-icon" />
              <h3>Tea Delivered</h3>
              <p className="card-value">{formatNumber(dashboardData.teaDeliveries.total)} Kg</p>
              <p className="card-description">Total tea delivered this month</p>
              <div className="view-details">View Details →</div>
            </div>

            <div className="dashboard-card">
              <FaMoneyBillWave className="card-icon" />
              <h3>Last Payment</h3>
              {dashboardData.payments.amount > 0 ? (
                <p className="card-value">Rs. {formatNumber(dashboardData.payments.amount)}</p>
              ) : (
                <p className="card-value">Payment not finalized</p>
              )}
              <p className="card-description">Most recent approved payment</p>
            </div>

          </div>

          {/* Row 2 - Advances */}
          <div className="dashboard-card full-width clickable" onClick={fetchAdvanceDetails}>
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
            <div className="view-details">View Details →</div>
          </div>

          {/* Row 3 - Fertilizer Requests */}
          <div className="dashboard-card full-width clickable" onClick={fetchFertilizerDetails}>
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
            <div className="view-details">View Details →</div>
          </div>
        </div>
      )}

      {/* Modal for Detailed Views */}
      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <h3>
              {activeModal === 'tea' && 'Tea Delivery Details'}
              {activeModal === 'advances' && 'Advance Payment Details'}
              {activeModal === 'fertilizer' && 'Fertilizer Request Details'}
              <span className="modal-subtitle"> - {monthNames[currentMonth - 1]} {currentYear}</span>
            </h3>

            {modalLoading ? (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                Loading details...
              </div>
            ) : (
              <div className="modal-table-container">
                {activeModal === 'tea' && (
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Gross Weight (kg)</th>
                        <th>Water Deduction</th>
                        <th>Damage Deduction</th>
                        <th>Sack Deduction</th>
                        <th>Net Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((delivery, index) => (
                        <tr key={index}>
                          <td>{new Date(delivery.date).toLocaleDateString()}</td>
                          <td>{delivery.tea_sack_weight}</td>
                          <td>{delivery.deduction_water}</td>
                          <td>{delivery.deduction_damage_tea}</td>
                          <td>{delivery.deduction_sack_weight}</td>
                          <td>{delivery.final_tea_sack_weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeModal === 'advances' && (
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount (Rs)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((advance, index) => (
                        <tr key={index}>
                          <td>{new Date(advance.date).toLocaleDateString()}</td>
                          <td>{advance.amount.toLocaleString()}</td>
                          <td className={`status-${advance.action.toLowerCase()}`}>
                            {advance.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeModal === 'fertilizer' && (
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Fertilizer Type</th>
                        <th>Packet Size</th>
                        <th>Quantity</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((request, index) => (
                        <tr key={index}>
                          <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                          <td>{request.fertilizerType}</td>
                          <td>{request.packetType}</td>
                          <td>{request.amount}</td>
                          <td>{request.paymentoption === 'cash' ? 'Cash' : 'Deduct from Payment'}</td>
                          <td className={`status-${request.status.toLowerCase()}`}>
                            {request.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {modalData.length === 0 && (
                  <div className="no-data-message">No records found for this period</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFarmer;