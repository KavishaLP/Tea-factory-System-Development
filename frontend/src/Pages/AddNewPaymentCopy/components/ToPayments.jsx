import React from "react";

function ToPayments({ 
  paymentsHistory, 
  historyLoading, 
  currentMonth, 
  currentYear,
  toPaymentsFilters,
  monthNames,
  navigateToPaymentsMonth 
}) {
  return (
    <div className="payment-history">
      <div className="month-navigation">
        <button onClick={() => navigateToPaymentsMonth("prev")}>&lt; Previous</button>
        <h3>
          {monthNames[toPaymentsFilters.month ? parseInt(toPaymentsFilters.month) - 1 : currentMonth]}{" "}
          {toPaymentsFilters.year || currentYear}
        </h3>
        <button onClick={() => navigateToPaymentsMonth("next")}>Next &gt;</button>
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
        <p>No payment records found for {monthNames[currentMonth]} {currentYear}.</p>
      )}
    </div>
  );
}

export default ToPayments;