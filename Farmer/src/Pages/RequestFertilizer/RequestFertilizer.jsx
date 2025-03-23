import React, { useState } from "react";
import axios from "axios";
import "./requestfertilizer.css";

const RequestFertilizer = () => {
  const [userId, setUserId] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");
  const [fertilizerPacketType, setFertilizerPacketType] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!userId || !fertilizerType || !fertilizerPacketType || !amount || amount <= 0) {
      setMessage("Please fill all fields and enter a valid amount.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    // Prepare data to send to the backend
    const requestData = {
      userId,
      fertilizerType,
      fertilizerPacketType,
      amount,
    };

    try {
      // Send data to the backend
      const response = await axios.post(
        "http://localhost:8081/api/farmer/fertilizer-request",
        requestData,
        { withCredentials: true } // Remove this if not using cookies/tokens
      );

      // Handle success
      setMessage("Fertilizer request submitted successfully!");
      console.log("Response from backend:", response.data);

      // Clear form fields
      setUserId("");
      setFertilizerType("");
      setFertilizerPacketType("");
      setAmount("");
    } catch (error) {
      // Handle error
      console.error("Error submitting fertilizer request:", error);
      setMessage(error.response?.data?.message || "An error occurred while submitting the request.");
    } finally {
      setIsLoading(false);
    }
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

        <label>Fertilizer Packet Type:</label>
        <select
          value={fertilizerPacketType}
          onChange={(e) => setFertilizerPacketType(e.target.value)}
          required
        >
          <option value="">Select Type</option>
          <option value="5">5 Kg</option>
          <option value="10">10 Kg</option>
          <option value="50">50 Kg</option>
        </select>

        <label>Total Packets:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="Enter amount"
        />

        {message && <p className="message">{message}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestFertilizer;