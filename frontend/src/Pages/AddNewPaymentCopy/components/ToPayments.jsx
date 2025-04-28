import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ToPayments() {
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [toPaymentsFilters, setToPaymentsFilters] = useState({
    year: currentYear,
    month: currentMonth + 1,
  });
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] = useState("");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchPaymentsHistory();
  }, [toPaymentsFilters]);

  const fetchPaymentsHistory = async () => {
    console.log("Fetching payments history for:", toPaymentsFilters);
    try {
      setHistoryLoading(true);
      
      // Changed to use query parameters instead of request body
      const response = await axios.get(
        `http://localhost:8081/api/manager/fetch-to-payments`,
        {
          params: {
            month: toPaymentsFilters.month,
            year: toPaymentsFilters.year
          }
        }
      );
      
      console.log(response.data);

      if (response.data.length === 0) {
        setPaymentsHistory([]);
      } else {
        setPaymentsHistory(response.data);
      }

      setHistoryLoading(false);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setHistoryLoading(false);
      setConfirmationMessage("Error fetching payment history");
      setConfirmationType("error");
    }
  };

  const navigateToPaymentsMonth = (direction) => {
    setToPaymentsFilters((prevFilters) => {
      let newMonth = prevFilters.month;
      let newYear = prevFilters.year;

      if (direction === "prev") {
        if (newMonth === 1) {
          newMonth = 12;
          newYear -= 1;
        } else {
          newMonth -= 1;
        }
      } else if (direction === "next") {
        const currentDate = new Date();
        const nextMonthDate = new Date(newYear, newMonth, 1); // First day of next month
        
        if (nextMonthDate > currentDate) {
          return prevFilters;
        }
        
        if (newMonth === 12) {
          newMonth = 1;
          newYear += 1;
        } else {
          newMonth += 1;
        }
      }

      return {
        year: newYear,
        month: newMonth,
      };
    });
  };

  return (
    <div className="payment-history">
      {confirmationMessage && (
        <div className={`confirmation-message ${confirmationType}`}>
          {confirmationMessage}
        </div>
      )}
      
      <div className="month-navigation">
        <button onClick={() => navigateToPaymentsMonth("prev")}>{"<"} Previous</button>
        <h3>
          {monthNames[toPaymentsFilters.month - 1]} {toPaymentsFilters.year}
        </h3>
        <button
          onClick={() => navigateToPaymentsMonth("next")}
          disabled={
            new Date(toPaymentsFilters.year, toPaymentsFilters.month, 1) >= 
            new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        >
          Next {">"}
        </button>
      </div>

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