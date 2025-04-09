import React, { useState } from "react";
import axios from "axios";
import "./RequestAdvance.css"; // Import the CSS file

const RequestAdvance = ({userId}) => {
  const [formData, setFormData] = useState({
    farmerId: userId,
    amount: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.farmerId || !formData.amount || formData.amount <= 0) {
      setError("Please enter a valid farmer ID and amount.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Send data to backend API
    axios
      .post("http://localhost:8081/api/farmer/request-advance", formData, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("Advance request submitted:", response.data);
        alert("Advance request submitted successfully!");
        setFormData({
          amount: "",
        });
      })
      .catch((error) => {
        console.error("Error submitting advance request:", error);
        setError(error.response?.data?.message || "An error occurred");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="request-advance-container">
      <div className="page-header">
        <h2>Request Advance</h2>
      </div>
      <form onSubmit={handleSubmit}>

        <div className="input-group">
          <label>Advance Amount (Rs):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="Enter Amount"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
          {isLoading ? "Submitting..." : "Request Advance"}
        </button>
      </form>
    </div>
  );
};

export default RequestAdvance;