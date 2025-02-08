import React from "react";
import "./fertilizer.css";

const Fertilizer = () => {
  return (
    <div className="fertilizer-container">
      {/* Right Column - Fertilizer Requests Table */}
      <div className="column-right">
        <div className="requests-section">
          <div className="requests-header">
            <h2>Fertilizer Requests</h2>
            <button className="history-button">History</button>
          </div>

          <table className="requests-table">
            <thead>
              <tr>
                <th>User Id</th>
                <th>User Name</th>
                <th>Fertilizer Type</th>
                <th>Amount (Kilos)</th>
                <th>To Confirm</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td>Test</td>
                  <td>Test</td>
                  <td>Test</td>
                  <td>Test</td>
                  <td>
                    <button className="confirm-button">To Confirm</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fertilizer;