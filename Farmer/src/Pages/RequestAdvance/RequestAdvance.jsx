import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RequestAdvance.css";

const RequestAdvance = ({ userId }) => {
  const [formData, setFormData] = useState({
    farmerId: userId,
    amount: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Ensure farmerId is always set from props
  useEffect(() => {
    if (userId) {
      setFormData(prev => ({ ...prev, farmerId: userId }));
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Enhanced validation
    if (!formData.farmerId) {
      setError("Farmer ID is missing. Please try refreshing the page.");
      return;
    }

    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setError("");
    setIsLoading(true);
    setSuccessMessage("");

    // Prepare data with parsed amount
    const requestData = {
      farmerId: formData.farmerId,
      amount: amountValue
    };

    axios.post("http://localhost:8081/api/farmer/request-advance", requestData, {
      withCredentials: true,
    })
    .then((response) => {
      setSuccessMessage("Advance request submitted successfully!");
      setFormData(prev => ({ ...prev, amount: "" }));
    })
    .catch((error) => {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "Failed to submit advance request";
      setError(errorMsg);
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
            min="0.01"
            step="0.01"
            placeholder="Enter Amount"
          />
        </div>

        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <button 
          type="submit" 
          disabled={isLoading || !formData.farmerId} 
          className={isLoading ? "loading" : ""}
        >
          {isLoading ? "Submitting..." : "Request Advance"}
        </button>
      </form>
    </div>
  );
};

export default RequestAdvance;