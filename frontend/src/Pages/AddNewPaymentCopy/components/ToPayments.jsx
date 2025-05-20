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

      <div className="tea-price-section">
        {isEditingPrice ? (
          <div className="price-edit-form">
            <input
              type="number"
              step="0.01"
              value={newTeaPrice}
              onChange={(e) => setNewTeaPrice(e.target.value)}
              placeholder="Enter price per kilo"
            />
            <button onClick={handlePriceUpdate}>Save Price</button>
            <button onClick={() => setIsEditingPrice(false)}>Cancel</button>
          </div>
        ) : (
          <div className="price-display">
            <span>Current Tea Price: {teaPrice ? `LKR ${teaPrice}` : 'Not set'}</span>
            <button onClick={() => setIsEditingPrice(true)}>Edit Price</button>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {historyLoading ? (
        <p>Loading...</p>
      ) : paymentsHistory.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Final Tea Kilos</th>
              <th>Payment Per Kilo</th>
              <th>Final Amount</th>
              <th>Advances</th>
              <th>Final Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentsHistory.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.userId}</td>
                <td>{payment.finalTeaKilos}</td>
                <td>{teaPrice || payment.paymentPerKilo}</td>
                <td>{(payment.finalTeaKilos * (teaPrice || payment.paymentPerKilo)).toFixed(2)}</td>
                <td>{payment.advances}</td>
                <td>
                  {(
                    payment.finalTeaKilos * (teaPrice || payment.paymentPerKilo) - 
                    payment.advances
                  ).toFixed(2)}
                </td>
                <td>{new Date(payment.created_at).toLocaleDateString("en-US")}</td>
                <td>{payment.status}</td>
                <td>
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
      ) : (
        <p>No records available for {monthNames[toPaymentsFilters.month - 1]} {toPaymentsFilters.year}.</p>
      )}
    </div>
  );
}

export default ToPayments;