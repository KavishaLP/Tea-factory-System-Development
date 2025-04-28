import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed for API requests

function ToPayments() {
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [toPaymentsFilters, setToPaymentsFilters] = useState({
    year: currentYear,
    month: currentMonth + 1, // JavaScript months are 0-indexed, so add 1
  });
  const [confirmationMessage, setConfirmationMessage] = useState(""); // State for confirmation message
  const [confirmationType, setConfirmationType] = useState(""); // State to determine the type of confirmation (success or error)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Effect hook to fetch payment history when filters change
  useEffect(() => {
    fetchPaymentsHistory();
  }, [toPaymentsFilters]); // Runs when filters change (month or year)

  // Fetch payment history based on selected filters (month and year)
  const fetchPaymentsHistory = async () => {
    console.log("Fetching payments history for:"); // Log the filters for debugging
    try {
      setHistoryLoading(true); // Start loading

      // Make API request to fetch payments history
      const response = await axios.get(
        `http://localhost:8081/api/manager/fetch-payments-history`,
        { params: { month: toPaymentsFilters.month, year: toPaymentsFilters.year } }
      );
      console.log(response.data); // Log the response for debugging

      // Check if data is returned
      if (response.data.length === 0) {
        setPaymentsHistory([]); // If no data, show empty message
      } else {
        setPaymentsHistory(response.data); // Set data into state
      }

      setHistoryLoading(false); // End loading
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setHistoryLoading(false); // End loading on error
    }
  };

  // Navigate through months (previous or next)
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
        // Prevent navigation to future months
        const currentDate = new Date();
        const nextMonthDate = new Date(newYear, newMonth); // Create a date object from newYear and newMonth
        if (nextMonthDate > currentDate) {
          return prevFilters; // If trying to navigate to future month, do nothing
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
      {/* Month navigation buttons */}
      <div className="month-navigation">
        <button onClick={() => navigateToPaymentsMonth("prev")}>{"<"} Previous</button>
        <h3>
          {monthNames[toPaymentsFilters.month - 1]} {toPaymentsFilters.year}
        </h3>
        <button
          onClick={() => navigateToPaymentsMonth("next")}
          disabled={new Date(toPaymentsFilters.year, toPaymentsFilters.month) > new Date()} // Disable next button if future month
        >
          Next {">"}
        </button>
      </div>

      {/* Conditional rendering based on loading state */}
      {historyLoading ? (
        <p>Loading...</p> // Show loading message while fetching data
      ) : paymentsHistory.length > 0 ? (
        // Show payments table if records exist
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
        // Show no records found message if there are no payments for this month
        <p>No records available for {monthNames[toPaymentsFilters.month - 1]} {toPaymentsFilters.year}.</p>
      )}
    </div>
  );
}

export default ToPayments;
