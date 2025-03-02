import React, { useState } from "react";
import "./RequestAdvance.css"; // Import the CSS file

const RequestAdvance = () => {
  const [farmerId, setFarmerId] = useState(""); // Store farmer ID
  const [amount, setAmount] = useState(""); // Store requested amount
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setMessage("Advance request submitted successfully!");
  };

  return (
    <div className="request-advance-container">
      <div className="page-header">     
        <h2>Request Advance</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <label>Farmer ID:</label>
        <input
          type="text"
          value={farmerId}
          onChange={(e) => setFarmerId(e.target.value)}
          required
          placeholder="Enter Farmer ID"
        />

        <label>Advance Amount (Rs):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="Enter Amount"
        />

        {message && <p className="message">{message}</p>}

        <button type="submit">Request Advance</button>
      </form>
    </div>
  );
};

export default RequestAdvance;
