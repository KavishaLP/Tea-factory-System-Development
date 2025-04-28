import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaSeedling, FaHistory, FaTimes } from "react-icons/fa";
import axios from "axios";
import "./DashboardFarmer.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [modalTitle, setModalTitle] = useState("");

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

  const fetchTeaDeliveryDetails = async () => {
    try {
      setModalLoading(true);
      setModalTitle("Tea Delivery Details");
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const response = await axios.get("http://localhost:8081/api/farmer/tea-delivery-details", {
        params: { userId, monthYear }
      });
      setModalData(response.data.data || []);
      setActiveModal('tea');
    } catch (error) {
      console.error("Error fetching tea delivery details:", error);
      setError("Failed to load tea delivery details.");
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchAdvanceDetails = async () => {
    try {
      setModalLoading(true);
      setModalTitle("Advance Payment Details");
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const response = await axios.get("http://localhost:8081/api/farmer/advance-details", {
        params: { userId, monthYear }
      });
      setModalData(response.data.data || []);
      setActiveModal('advances');
    } catch (error) {
      console.error("Error fetching advance details:", error);
      setError("Failed to load advance details.");
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchFertilizerDetails = async () => {
    try {
      setModalLoading(true);
      setModalTitle("Fertilizer Request Details");
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const response = await axios.get("http://localhost:8081/api/farmer/fertilizer-request-details", {
        params: { userId, monthYear }
      });
      setModalData(response.data.data || []);
      setActiveModal('fertilizer');
    } catch (error) {
      console.error("Error fetching fertilizer details:", error);
      setError("Failed to load fertilizer request details.");
      setModalData([]);
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
    setModalTitle("");
  };

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        {/* ... (previous header and navigation code remains the same) ... */}

        {/* Modal for Detailed Views */}
        {activeModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-modal" onClick={closeModal}>
                <FaTimes />
              </button>
              
              <h3>
                {modalTitle}
                <span className="modal-subtitle"> - {monthNames[currentMonth - 1]} {currentYear}</span>
              </h3>

              {modalLoading ? (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  Loading details...
                </div>
              ) : (
                <div className="modal-table-container">
                  {modalData.length > 0 ? (
                    <table className="details-table">
                      <thead>
                        <tr>
                          {activeModal === 'tea' && (
                            <>
                              <th>Date</th>
                              <th>Gross Weight (kg)</th>
                              <th>Water Deduction</th>
                              <th>Damage Deduction</th>
                              <th>Sack Deduction</th>
                              <th>Other Deduction</th>
                              <th>Net Weight (kg)</th>
                            </>
                          )}
                          {activeModal === 'advances' && (
                            <>
                              <th>Date</th>
                              <th>Amount (Rs)</th>
                              <th>Status</th>
                            </>
                          )}
                          {activeModal === 'fertilizer' && (
                            <>
                              <th>Date</th>
                              <th>Fertilizer Type</th>
                              <th>Packet Size</th>
                              <th>Quantity</th>
                              <th>Payment Method</th>
                              <th>Status</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((item, index) => (
                          <tr key={index}>
                            {activeModal === 'tea' && (
                              <>
                                <td>{new Date(item.date).toLocaleDateString()}</td>
                                <td>{formatNumber(item.tea_sack_weight)}</td>
                                <td>{formatNumber(item.deduction_water)}</td>
                                <td>{formatNumber(item.deduction_damage_tea)}</td>
                                <td>{formatNumber(item.deduction_sack_weight)}</td>
                                <td>{formatNumber(item.deduction_other)}</td>
                                <td>{formatNumber(item.final_tea_sack_weight)}</td>
                              </>
                            )}
                            {activeModal === 'advances' && (
                              <>
                                <td>{new Date(item.date).toLocaleDateString()}</td>
                                <td>{formatNumber(item.amount)}</td>
                                <td className={`status-${item.status.toLowerCase()}`}>
                                  {item.status}
                                </td>
                              </>
                            )}
                            {activeModal === 'fertilizer' && (
                              <>
                                <td>{new Date(item.date).toLocaleDateString()}</td>
                                <td>{item.fertilizerType}</td>
                                <td>{item.packetType}</td>
                                <td>{item.amount}</td>
                                <td>{item.paymentMethod === 'cash' ? 'Cash' : 'Deduct from Payment'}</td>
                                <td className={`status-${item.status.toLowerCase()}`}>
                                  {item.status}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-data-message">No records found for this period</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardFarmer;