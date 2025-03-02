import React, { useState } from "react";
import "./requestfertilizer.css";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const RequestFertilizer = () => {
  const [userId, setUserId] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setMessage("Fertilizer request submitted successfully!");
  };

  return (
    <div className="request-fertilizer-container">
      <div className="page-header">
        <h2>Request Fertilizer</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          placeholder="Enter User ID"
        />

        <label>Fertilizer Type:</label>
        <select
          value={fertilizerType}
          onChange={(e) => setFertilizerType(e.target.value)}
          required
        >
          <option value="">Select Type</option>
          <option value="Urea">Urea</option>
          <option value="Compost">Compost</option>
          <option value="NPK">NPK</option>
          <option value="DAP">DAP</option>
        </select>

        <label>Fertilizer Amount (Kilos):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="Enter amount"
        />

        {message && <p className="message">{message}</p>}

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestFertilizer;
