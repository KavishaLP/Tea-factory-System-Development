import React, { useState } from "react";
import axios from "axios";
import "./RequestAdvance.css"; // Import the CSS file

const RequestAdvance = ({ userId }) => {
  const [formData, setFormData] = useState({
    farmerId: userId,
    amount: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/farmer/request-advance",
        formData,
        { withCredentials: true }
      );

      console.log("Advance request submitted:", response.data);
      alert("Advance request submitted successfully!");

      // Reset only amount, keep farmerId
      setFormData((prevData) => ({
        ...prevData,
        amount: "",
      }));
    } catch (error) {
      console.error("Error submitting advance request:", error);
      setError(
        error.response?.data?.message || "An error occurred while submitting the request."
      );
    } finally {
      setIsLoading(false);
    }
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
            min="1"
            step="0.01"
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
