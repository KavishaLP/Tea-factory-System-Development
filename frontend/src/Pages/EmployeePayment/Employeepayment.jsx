import React, { useState } from "react";
import "./Employeepayment.css";

function Employeepayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [formData, setFormData] = useState({
    userId: "",
    salaryAmount: "",
    additionalPayments: "",
    deductions: "",
    advances: "",
    finalAmount: "",
    finalPayment: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle change for input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow empty input or valid numeric values (including decimals)
    if (name !== "userId" && value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Calculate final payment when salary, additional payments, or deductions change
      const salary = parseFloat(updatedData.salaryAmount) || 0;
      const additional = parseFloat(updatedData.additionalPayments) || 0;
      const deductions = parseFloat(updatedData.deductions) || 0;

      updatedData.finalPayment = (salary + additional - deductions).toFixed(2);

      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Perform validation
    if (!formData.userId || !formData.salaryAmount) {
      setError("User ID and Salary Amount are required");
      setIsLoading(false);
      return;
    }

    // Simulate API call
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
              <label>Salary Amount</label>
              <input
                type="text"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleChange}
                required
                placeholder="Enter salary amount"
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
              <label>Final Payment</label>
              <input
                type="text"
                name="finalPayment"
                value={formData.finalPayment}
                readOnly
                placeholder="Calculated final payment"
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
