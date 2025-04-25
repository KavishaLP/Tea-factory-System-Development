import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './viewpayment.css';

function ViewPayment({ userId }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null); // To store selected payment details

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/farmer/payments/${userId}`, {
          withCredentials: true,
        });
        setPayments(response.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err.response?.data?.message || 'Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  const handleSeeMoreClick = (payment) => {
    setSelectedPayment(payment); // Store selected payment in state
  };

  const closeModal = () => {
    setSelectedPayment(null); // Close the modal by resetting the state
  };

  return (
    <div className="view-payments-container">
      <div className="page-header">
        <h2>View Previous Payments</h2>
      </div>

      {isLoading ? (
        <p>Loading payments...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div className="content-box">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Payment Per Kilo (Rs)</th>
                <th>Final Tea Kilos</th>
                <th>Final Amount (Rs)</th>
                <th>Advances (Rs)</th>
                <th>Final Payment (Rs)</th>
                <th>Action</th> {/* Add "See More" column */}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td>{payment.paymentPerKilo}</td>
                  <td>{payment.finalTeaKilos}</td>
                  <td>{payment.finalAmount}</td>
                  <td>{payment.advances}</td>
                  <td>{payment.finalPayment}</td>
                  <td>
                    <button
                      className="see-more-btn"
                      onClick={() => handleSeeMoreClick(payment)} // Show more details on click
                    >
                      See More
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal to show detailed payment information */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Payment Details</h3>
            <p><strong>Date:</strong> {new Date(selectedPayment.created_at).toLocaleDateString()}</p>
            <p><strong>Payment Per Kilo:</strong> {selectedPayment.paymentPerKilo}</p>
            <p><strong>Final Tea Kilos:</strong> {selectedPayment.finalTeaKilos}</p>
            <p><strong>Payment For Final Tea Kilos:</strong> {selectedPayment.paymentForFinalTeaKilos}</p>
            <p><strong>Additional Payments:</strong> {selectedPayment.additionalPayments}</p>
            <p><strong>Transport:</strong> {selectedPayment.transport}</p>
            <p><strong>Direct Payments:</strong> {selectedPayment.directPayments}</p>
            <p><strong>Final Amount:</strong> {selectedPayment.finalAmount}</p>
            <p><strong>Advances:</strong> {selectedPayment.advances}</p>
            <p><strong>Tea Packets:</strong> {selectedPayment.teaPackets}</p>
            <p><strong>Fertilizer:</strong> {selectedPayment.fertilizer}</p>
            <p><strong>Final Payment:</strong> {selectedPayment.finalPayment}</p>

            <button className="close-modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPayment;
