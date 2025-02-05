import React, { useState } from "react";
import "./fertilizer.css";

const Fertilizer = () => {
  const [userId, setUserId] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Fertilizer Request:", { userId, fertilizerType, amount });
  };

  return (
    <div className="fertilizer-container">
      {/* Left Column - Fertilizer Request Form */}
      <div className="column-left">
        <div className="fertilizer-distribution">
          <h2>Fertilizer Request</h2>
          <form className="distribution-form" onSubmit={handleSubmit}>
            <label>User Id</label>
            <input
              type="text"
              placeholder="Enter User Id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <label>Fertilizer Type</label>
            <select
              value={fertilizerType}
              onChange={(e) => setFertilizerType(e.target.value)}
              required
            >
              <option value="">Select Fertilizer Type</option>
              <option value="Urea">Urea</option>
              <option value="Compost">Compost</option>
              <option value="Phosphate">Phosphate</option>
              <option value="Potash">Potash</option>
            </select>

            <label>Amount (in Kilos)</label>
            <input
              type="number"
              placeholder="Enter amount in Kilos"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <button type="submit" className="submit-button">
              Submit Request
            </button>
          </form>
        </div>
      </div>

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
