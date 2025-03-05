import React, { useState } from "react";
import "./ProductivityReport.css";

function ProductivityReport() {
  const [activeTab, setActiveTab] = useState("addReport");
  const [formData, setFormData] = useState({
    recievedTeaKilos: "",
    teaPacketsManufactured: "",
    salaryForEmployees: "",
    FarmerPayments: "",
    finalReport: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle change for input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow empty input or valid numeric values (including decimals)
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Calculate final report when fields change
      const recievedTeaKilos = parseFloat(updatedData.recievedTeaKilos) || 0;
      const teaPacketsManufactured = parseFloat(updatedData.teaPacketsManufactured) || 0;
      const salaryForEmployees = parseFloat(updatedData.salaryForEmployees) || 0;
      const FarmerPayments = parseFloat(updatedData.FarmerPayments) || 0;

      updatedData.finalReport = `Received Tea Kilos: ${recievedTeaKilos}, Tea Packets Manufactured: ${teaPacketsManufactured}, Salary for Employees: ${salaryForEmployees}, Farmer Payments: ${FarmerPayments}`;
      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Perform validation
    if (!formData.recievedTeaKilos || !formData.teaPacketsManufactured || !formData.salaryForEmployees) {
      setError("All fields except Farmer Payments are required");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      alert("Productivity report submitted successfully!");
      setIsLoading(false);
      setFormData({
        recievedTeaKilos: "",
        teaPacketsManufactured: "",
        salaryForEmployees: "",
        FarmerPayments: "",
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
              <label>Received Tea Kilos</label>
              <input
                type="text"
                name="recievedTeaKilos"
                value={formData.recievedTeaKilos}
                onChange={handleChange}
                required
                placeholder="Enter received tea kilos"
              />
            </div>

            <div className="input-group">
              <label>Tea Packets Manufactured</label>
              <input
                type="text"
                name="teaPacketsManufactured"
                value={formData.teaPacketsManufactured}
                onChange={handleChange}
                required
                placeholder="Enter tea packets manufactured"
              />
            </div>

            <div className="input-group">
              <label>Salary for Employees</label>
              <input
                type="text"
                name="salaryForEmployees"
                value={formData.salaryForEmployees}
                onChange={handleChange}
                required
                placeholder="Enter salary for employees"
              />
            </div>

            <div className="input-group">
              <label>Farmer Payments (Optional)</label>
              <input
                type="text"
                name="FarmerPayments"
                value={formData.FarmerPayments}
                onChange={handleChange}
                placeholder="Enter farmer payments"
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
                  <th>Received Tea Kilos</th>
                  <th>Tea Packets Manufactured</th>
                  <th>Salary for Employees</th>
                  <th>Farmer Payments</th>
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
