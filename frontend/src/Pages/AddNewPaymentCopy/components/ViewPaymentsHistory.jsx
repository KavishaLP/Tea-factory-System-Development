import React from "react";

function ViewPaymentsHistory({
  filteredHistory,
  historyLoading,
  searchTerm,
  filters,
  monthNames,
  handleFilterChange,
  resetFilters,
  setSearchTerm
}) {
  return (
    <div className="payment-history">
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
        >
          <option value="">Select Year</option>
          {[2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          name="month"
          value={filters.month}
          onChange={handleFilterChange}
        >
          <option value="">Select Month</option>
          {monthNames.map((month, index) => (
            <option key={index + 1} value={index + 1}>{month}</option>
          ))}
        </select>
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      {historyLoading ? (
        <p>Loading...</p>
      ) : filteredHistory.length > 0 ? (
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
            {filteredHistory.map((payment, index) => (
              <tr key={index}>
                <td>{payment.userId}</td>
                <td>{payment.finalTeaKilos}</td>
                <td>{payment.paymentPerKilo}</td>
                <td>{payment.finalAmount}</td>
                <td>{payment.advances}</td>
                <td>{payment.finalPayment}</td>
                <td>{new Date().toLocaleDateString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No payment records found.</p>
      )}
    </div>
  );
}

export default ViewPaymentsHistory;