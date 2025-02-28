import React from 'react';
import './viewpayment.css';

function viewpayment() {
  return (
    <div className="view-payments-container">
      <div className="page-header">
        <h1>View Previous Payments</h1>
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

export default viewpayment;
