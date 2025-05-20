// pages/AddNewPaymentCopy/components/ToPayments.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ToPayments() {
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [toPaymentsFilters, setToPaymentsFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [error, setError] = useState(null);
  const [teaPrice, setTeaPrice] = useState('');
  const [newTeaPrice, setNewTeaPrice] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchPaymentsHistory();
    fetchTeaPrice();
  }, [toPaymentsFilters.month, toPaymentsFilters.year]);

  const fetchPaymentsHistory = async () => {
    try {
      setHistoryLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:8081/api/manager/fetch-to-payments`,
        {
          params: {
            month: toPaymentsFilters.month,
            year: toPaymentsFilters.year
          }
        }
      );

      setPaymentsHistory(response.data);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to fetch payment history. Please try again.');
      setHistoryLoading(false);
      setPaymentsHistory([]);
    }
  };

  const fetchTeaPrice = async () => {
    try {
      const monthYear = `${toPaymentsFilters.year}-${toPaymentsFilters.month.toString().padStart(2, '0')}`;
      const response = await axios.get(
        `http://localhost:8081/api/manager/fetch-tea-price`,
        { params: { month_year: monthYear } }
      );
      setTeaPrice(response.data.price || '');
      setNewTeaPrice(response.data.price || '');
    } catch (error) {
      console.error('Error fetching tea price:', error);
      setTeaPrice('');
      setNewTeaPrice('');
    }
  };

  const navigateToPaymentsMonth = (direction) => {
    setToPaymentsFilters(prev => {
      let newMonth = prev.month;
      let newYear = prev.year;

      if (direction === "prev") {
        newMonth--;
        if (newMonth < 1) {
          newMonth = 12;
          newYear--;
        }
      } else if (direction === "next") {
        const currentDate = new Date();
        const selectedDate = new Date(newYear, newMonth);
        
        if (selectedDate > currentDate) {
          return prev;
        }
        
        newMonth++;
        if (newMonth > 12) {
          newMonth = 1;
          newYear++;
        }
      }

      return { month: newMonth, year: newYear };
    });
  };

  const handlePriceUpdate = async () => {
    try {
      const monthYear = `${toPaymentsFilters.year}-${toPaymentsFilters.month.toString().padStart(2, '0')}`;
      await axios.post(`http://localhost:8081/api/manager/update-tea-price`, {
        price: parseFloat(newTeaPrice),
        month_year: monthYear
      });
      setTeaPrice(newTeaPrice);
      setIsEditingPrice(false);
      fetchPaymentsHistory(); // Refresh payments with new price
    } catch (error) {
      console.error('Error updating tea price:', error);
      setError('Failed to update tea price. Please try again.');
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await axios.put(`http://localhost:8081/api/manager/approve-payment`, {
        paymentId
      });
      fetchPaymentsHistory(); // Refresh the list
    } catch (error) {
      console.error('Error approving payment:', error);
      setError('Failed to approve payment. Please try again.');
    }
  };

  const openDetailsPopup = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsPopup(true);
  };

  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedPayment(null);
  };

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toFixed(2);
  };

  // Calculate derived values for the selected payment
  const calculatedFinalAmount = selectedPayment ? 
    parseFloat(selectedPayment.finalTeaKilos) * parseFloat(teaPrice || selectedPayment.paymentPerKilo) : 0;
  
  const calculatedFinalPayment = selectedPayment ? 
    calculatedFinalAmount - 
    parseFloat(selectedPayment.advances || 0) - 
    parseFloat(selectedPayment.teaPackets || 0) - 
    parseFloat(selectedPayment.fertilizer || 0) + 
    parseFloat(selectedPayment.additionalPayments || 0) + 
    parseFloat(selectedPayment.transport || 0) + 
    parseFloat(selectedPayment.directPayments || 0) : 0;

  return (
    <div className="payment-history">
      <div className="month-navigation">
        <button onClick={() => navigateToPaymentsMonth("prev")}>{"<"} Previous</button>
        <h3>
          {monthNames[toPaymentsFilters.month - 1]} {toPaymentsFilters.year}
        </h3>
        <button
          onClick={() => navigateToPaymentsMonth("next")}
          disabled={
            new Date(toPaymentsFilters.year, toPaymentsFilters.month) >=
            new Date(new Date().getFullYear(), new Date().getMonth() + 1)
          }
        >
          Next {">"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {historyLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      ) : paymentsHistory.length > 0 ? (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Tea Kilos</th>
                <th>Rate/kg</th>
                <th>Amount</th>
                <th>Advances</th>
                <th>Final Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentsHistory.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.userId}</td>
                  <td>{formatCurrency(payment.finalTeaKilos)}</td>
                  <td>{formatCurrency(teaPrice || payment.paymentPerKilo)}</td>
                  <td>{formatCurrency(payment.finalTeaKilos * (teaPrice || payment.paymentPerKilo))}</td>
                  <td>{formatCurrency(payment.advances)}</td>
                  <td>
                    {formatCurrency(
                      payment.finalTeaKilos * (teaPrice || payment.paymentPerKilo) - 
                      payment.advances
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="view-details-btn"
                      onClick={() => openDetailsPopup(payment)}
                    >
                      View Details
                    </button>
                    {payment.status === 'Pending' && (
                      <button 
                        onClick={() => handleApprovePayment(payment.id)}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data-message">
          <p>No payment records available for {monthNames[toPaymentsFilters.month - 1]} {toPaymentsFilters.year}.</p>
        </div>
      )}

      {/* Payment Details Popup */}
      {showDetailsPopup && selectedPayment && (
        <div className="popup-overlay">
          <div className="payment-details-popup">
            <div className="popup-header">
              <h3>Payment Details</h3>
              <button className="close-popup" onClick={closeDetailsPopup}>&times;</button>
            </div>
            <div className="popup-content">
              <div className="details-grid">
                <div className="details-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">{selectedPayment.userId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(selectedPayment.created_at).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedPayment.status.toLowerCase()}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Tea Production</h4>
                  <div className="detail-row">
                    <span className="detail-label">Final Tea Kilos:</span>
                    <span className="detail-value">{formatCurrency(selectedPayment.finalTeaKilos)} kg</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Per Kilo:</span>
                    <span className="detail-value">Rs. {formatCurrency(teaPrice || selectedPayment.paymentPerKilo)}</span>
                  </div>
                  <div className="detail-row highlight">
                    <span className="detail-label">Tea Payment Amount:</span>
                    <span className="detail-value">Rs. {formatCurrency(calculatedFinalAmount)}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Additions</h4>
                  <div className="detail-row">
                    <span className="detail-label">Additional Payments:</span>
                    <span className="detail-value">Rs. {formatCurrency(selectedPayment.additionalPayments)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transport:</span>
                    <span className="detail-value">Rs. {formatCurrency(selectedPayment.transport)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Direct Payments:</span>
                    <span className="detail-value">Rs. {formatCurrency(selectedPayment.directPayments)}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Deductions</h4>
                  <div className="detail-row">
                    <span className="detail-label">Advances:</span>
                    <span className="detail-value">Rs. {formatCurrency(selectedPayment.advances)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tea Packets:</span>
                    <span className="detail-value">Rs. {formatCurrency(selectedPayment.teaPackets)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fertilizer:</span>
                    <span className="detail-value">Rs. {formatCurrency(selectedPayment.fertilizer)}</span>
                  </div>
                </div>

                <div className="details-section full-width">
                  <div className="detail-row final-payment">
                    <span className="detail-label">Final Payment:</span>
                    <span className="detail-value">Rs. {formatCurrency(calculatedFinalPayment)}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.status === 'Pending' && (
                <div className="popup-actions">
                  <button 
                    onClick={() => {
                      handleApprovePayment(selectedPayment.id);
                      closeDetailsPopup();
                    }}
                    className="approve-btn"
                  >
                    Approve Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ToPayments;