import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsPage = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);  // State for selected payment details
  const [showModal, setShowModal] = useState(false); // Control modal visibility

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

  const handleSeeMore = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Farmer Payments</h1>
      <table>
        <thead>
          <tr>
            <th>Payment Per Kilo</th>
            <th>Final Tea Kilos</th>
            <th>Payment for Final Tea Kilos</th>
            <th>Final Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.paymentPerKilo}</td>
              <td>{payment.finalTeaKilos}</td>
              <td>{payment.paymentForFinalTeaKilos}</td>
              <td>{payment.finalPayment}</td>
              <td>
                <button onClick={() => handleSeeMore(payment)}>See More</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for displaying selected payment details */}
      {showModal && selectedPayment && (
        <div className="modal">
          <div className="modal-content">
            <h2>Payment Details</h2>
            <p><strong>Payment Per Kilo:</strong> {selectedPayment.paymentPerKilo}</p>
            <p><strong>Final Tea Kilos:</strong> {selectedPayment.finalTeaKilos}</p>
            <p><strong>Payment for Final Tea Kilos:</strong> {selectedPayment.paymentForFinalTeaKilos}</p>
            <p><strong>Additional Payments:</strong> {selectedPayment.additionalPayments}</p>
            <p><strong>Transport:</strong> {selectedPayment.transport}</p>
            <p><strong>Direct Payments:</strong> {selectedPayment.directPayments}</p>
            <p><strong>Final Amount:</strong> {selectedPayment.finalAmount}</p>
            <p><strong>Advances:</strong> {selectedPayment.advances}</p>
            <p><strong>Tea Packets:</strong> {selectedPayment.teaPackets}</p>
            <p><strong>Fertilizer:</strong> {selectedPayment.fertilizer}</p>
            <p><strong>Final Payment:</strong> {selectedPayment.finalPayment}</p>
            <p><strong>Created At:</strong> {selectedPayment.created_at}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
