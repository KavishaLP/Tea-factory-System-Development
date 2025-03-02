import React from 'react';
import './viewpayment.css';

function ViewPayment() {
  return (
    <div className="view-payments-container">
      <div className="page-header">
        <h2>View Previous Payments</h2>
      </div>
      <div className="content-box">
        <table className="payments-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>User Name</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td>Test</td>
                <td>Test</td>
                <td>Test</td>
                <td>Test</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewPayment;
