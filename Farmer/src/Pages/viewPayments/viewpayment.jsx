import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Payments = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch payments from the backend
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

  // Handle modal open
  const handleSeeMoreClick = (payment) => {
    setSelectedPayment(payment);
  };

  // Handle modal close
  const closeModal = () => {
    setSelectedPayment(null);
  };

  return (
    <div className="payments-container">
      <h2>Payments</h2>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <p>Loading payments...</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Payment Per Kilo</th>
              <th>Final Tea Kilos</th>
              <th>Final Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.paymentPerKilo}</td>
                <td>{payment.finalTeaKilos}</td>
                <td>{payment.finalPayment}</td>
                <td>
                  <button
                    className="see-more-btn"
                    onClick={() => handleSeeMoreClick(payment)}
                  >
                    See More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for detailed view */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Payment Details</h3>
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
            <p><strong>Created At:</strong> {selectedPayment.created_at}</p>

            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
