import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './viewpayment.css';

function ViewPayment({ userId }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewPayment;
