import React, { useState } from "react";
import "./Fertilizer.css";

const Fertilizer = () => {
  const [activeTab, setActiveTab] = useState("newRequests"); // Tabs: newRequests or confirmedRequests
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Dummy data for productivity reports
  const dummyData = Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    date: `2024-03-${String(index + 1).padStart(2, "0")}`,
    userId: `USR${String(index + 1).padStart(3, "0")}`,
    userName: `Farmer ${index + 1}`,
    receivedTeaKilos: (index + 1) * 10,
    teaPacketsManufactured: (index + 1) * 5,
    salaryForEmployees: (index + 1) * 1000,
    farmerPayments: (index + 1) * 500,
    status: index % 2 === 0 ? "Completed" : "Pending",
  }));

  // Filter data based on search term, date, and status
  const filteredData = dummyData.filter((report) => {
    const matchesSearchTerm =
      report.userId.includes(searchTerm) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? report.date === filterDate : true;
    const matchesStatus =
      activeTab === "newRequests"
        ? report.status === "Pending"
        : report.status === "Completed";
    return matchesSearchTerm && matchesDate && matchesStatus;
  });

  return (
    <div className="cfa-content">
      <h2>Productivity Report History</h2>
      <div className="cfa-grid">
        <div className="history-section">
          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "newRequests" ? "active" : ""}`}
              onClick={() => setActiveTab("newRequests")}
            >
              New Requests
            </button>
            <button
              className={`tab-button ${activeTab === "confirmedRequests" ? "active" : ""}`}
              onClick={() => setActiveTab("confirmedRequests")}
            >
              Confirmed Requests
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="controls-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by User ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="search-icon">🔍</i>
            </div>
            <div className="date-filter">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          {/* History Table */}
          <div className="table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Received Tea Kilos</th>
                  <th>Tea Packets Manufactured</th>
                  <th>Salary for Employees</th>
                  <th>Farmer Payments</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((report) => (
                  <tr key={report.id}>
                    <td>{report.date}</td>
                    <td>{report.userId}</td>
                    <td>{report.userName}</td>
                    <td>{report.receivedTeaKilos}</td>
                    <td>{report.teaPacketsManufactured}</td>
                    <td>{report.salaryForEmployees}</td>
                    <td>{report.farmerPayments}</td>
                    <td>
                      <span className={`status ${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button>&laquo;</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>&raquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fertilizer;