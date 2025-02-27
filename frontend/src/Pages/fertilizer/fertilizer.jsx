/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./fertilizer.css";

const Fertilizer = () => {
  const navigate = useNavigate();

  const handleHistoryClick = () => {
    navigate('/Mng-Fertilizer-History');
  };

  return (
    <div className="cfa-content">
      <h2>Fertilizer Requests</h2>
      <div className="cfa-grid">
        <div className="requests-section">
          <div className="requests-header">
            <button className="history-button" onClick={handleHistoryClick}>History</button>
          </div>

          <table className="requests-table">
            <thead>
              <tr>
                <th>User ID</th>
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