import React, { useState } from "react";
import "./ProductivityReport.css";

function ProductivityReport() {
  const [activeTab, setActiveTab] = useState("addReport");
  const [formData, setFormData] = useState({

    hoursWorked: "",
    unitsProduced: "",
    performanceRating: "",
    reportDate: "",
    finalReport: "",
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

      // Calculate final report when hours worked, units produced, or performance rating change
      const hours = parseFloat(updatedData.hoursWorked) || 0;
      const units = parseFloat(updatedData.unitsProduced) || 0;
      const rating = parseFloat(updatedData.performanceRating) || 0;

      updatedData.finalReport = `Hours Worked: ${hours}, Units Produced: ${units}, Rating: ${rating}`;
      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Perform validation
    if (!formData.userId || !formData.hoursWorked || !formData.unitsProduced) {
      setError("User ID, Hours Worked, and Units Produced are required");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      alert("Productivity report submitted successfully!");
      setIsLoading(false);
      setFormData({
        userId: "",
        hoursWorked: "",
        unitsProduced: "",
        performanceRating: "",
        reportDate: "",
        finalReport: "",
      });
    }, 1000);
  };

  return (
    <div className="cfa-content">
      <h2>Productivity Report</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "addReport" ? "active" : ""}`}
            onClick={() => setActiveTab("addReport")}
          >
            Add New Report
          </button>
          <button
            className={`tab-button ${activeTab === "viewReports" ? "active" : ""}`}
            onClick={() => setActiveTab("viewReports")}
          >
            View Reports History
          </button>
        </div>

        {/* Add New Report Form */}
        {activeTab === "addReport" && (
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
              <label>Hours Worked</label>
              <input
                type="text"
                name="hoursWorked"
                value={formData.hoursWorked}
                onChange={handleChange}
                required
                placeholder="Enter hours worked"
              />
            </div>

            <div className="input-group">
              <label>Units Produced</label>
              <input
                type="text"
                name="unitsProduced"
                value={formData.unitsProduced}
                onChange={handleChange}
                required
                placeholder="Enter units produced"
              />
            </div>

            <div className="input-group">
              <label>Performance Rating (Optional)</label>
              <input
                type="text"
                name="performanceRating"
                value={formData.performanceRating}
                onChange={handleChange}
                placeholder="Enter performance rating"
              />
            </div>

            <div className="input-group">
              <label>Final Report</label>
              <input
                type="text"
                name="finalReport"
                value={formData.finalReport}
                readOnly
                placeholder="Generated final report"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {/* View Reports History Table */}
        {activeTab === "viewReports" && (
          <div className="reports-history">
            <h2>Reports History</h2>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Report Date</th>
                  <th>Hours Worked</th>
                  <th>Units Produced</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td>Test</td>
                    <td>Test</td>
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

export default ProductivityReport;
