import React, { useState } from "react";
import "./Employeepayment.css";

function Employeepayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [formData, setFormData] = useState({
    userId: "",
    salaryAmount: "",
    additionalPayments: "",
    deductions: "",
  
   
    finalPayment: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Perform validation
    if (!formData.userId || !formData.finalAmount) {
      setError("User ID and Final Amount are required");
      setIsLoading(false);
      return;
    }

    // Simulating API call
    setTimeout(() => {
      alert("Payment submitted successfully!");
      setIsLoading(false);
      setFormData({
        userId: "",
        salaryAmount: "",
        additionalPayments: "",
        deductions: "",
        advances: "",
        finalAmount: "",
        finalPayment: "",
      });
    }, 1000);
  };

  return (
    <div className="cfa-content">
      <h2>Payment Management</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "addPayment" ? "active" : ""}`}
            onClick={() => setActiveTab("addPayment")}
          >
            Add New Employee Payment
          </button>
          <button
            className={`tab-button ${activeTab === "viewHistory" ? "active" : ""}`}
            onClick={() => setActiveTab("viewHistory")}
          >
            View Payments History
          </button>
        </div>

        {/* Add New Payment Form */}
        {activeTab === "addPayment" && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                placeholder="Enter user ID"
              />
            </div>

            <div className="input-group">
              <label>Additional Payments</label>
              <input
                type="text"
                name="additionalPayments"
                value={formData.additionalPayments}
                onChange={handleChange}
                placeholder="Enter additional payments"
              />
            </div>

            <div className="input-group">
              <label>Deductions</label>
              <input
                type="text"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                placeholder="Enter deductions"
              />
            </div>

            <div className="input-group">
              <label>Advances</label>
              <input
                type="text"
                name="advances"
                value={formData.advances}
                onChange={handleChange}
                placeholder="Enter advances"
              />
            </div>

            <div className="input-group">
              <label>Final Amount</label>
              <input
                type="text"
                name="finalAmount"
                value={formData.finalAmount}
                onChange={handleChange}
                placeholder="Enter final amount"
              />
            </div>

            <div className="input-group">
              <label>Final Payment</label>
              <input
                type="text"
                name="finalPayment"
                value={formData.finalPayment}
                onChange={handleChange}
                placeholder="Calculated final payment"
                readOnly
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {/* View Payments History Table */}
        {activeTab === "viewHistory" && (
          <div className="payments-history">
            <h2>Payments History</h2>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Date</th>
                  <th>Amount</th>
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
        )}
      </div>
    </div>
  );
}

export default Employeepayment;