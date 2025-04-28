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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchPaymentsHistory();
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
        // Check if trying to navigate to future month
        const currentDate = new Date();
        const selectedDate = new Date(newYear, newMonth); // Next month
        
        if (selectedDate > currentDate) {
          return prev; // Don't update if future month
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
            </tr>
          </thead>
          <tbody>
            {paymentsHistory.map((payment, index) => (
              <tr key={index}>
                <td>{payment.userId}</td>
                <td>{payment.finalTeaKilos}</td>
                <td>{payment.paymentPerKilo}</td>
                <td>{payment.finalAmount}</td>
                <td>{payment.advances}</td>
                <td>{payment.finalPayment}</td>
                <td>{new Date(payment.created_at).toLocaleDateString("en-US")}</td>
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