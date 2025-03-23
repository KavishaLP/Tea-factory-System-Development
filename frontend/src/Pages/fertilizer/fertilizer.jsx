import React, { useState } from "react";
import "./Fertilizer.css";

const Fertilizer = () => {
  const [activeTab, setActiveTab] = useState("newRequests"); // Tabs: newRequests or confirmedRequests
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Dummy data for fertilizer requests
  const dummyData = Array.from({ length: 10 }).map((_, index) => ({
    request_id: index + 1,
    userId: `USR${String(index + 1).padStart(3, "0")}`,
    userName: `Farmer ${index + 1}`,
    fertilizerType: ["Urea", "Compost", "NPK"][index % 3],
    packetType: ["5", "10", "50"][index % 3],
    amount: (index + 1) * 5,
    requestDate: `2024-03-${String(index + 1).padStart(2, "0")}`,
    status: index % 2 === 0 ? "Pending" : "Completed",
    paymentOption: ["Cash", "Credit"][index % 2],
  }));

  // Filter data based on search term, date, and status
  const filteredData = dummyData.filter((request) => {
    const matchesSearchTerm =
      request.userId.includes(searchTerm) ||
      request.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? request.requestDate === filterDate : true;
    const matchesStatus =
      activeTab === "newRequests"
        ? request.status === "Pending"
        : request.status === "Completed";
    return matchesSearchTerm && matchesDate && matchesStatus;
  });

  // Handle Confirm action
  const handleConfirm = (requestId) => {
    alert(`Confirmed request with ID: ${requestId}`);
    // Add backend logic to update status to "Completed"
  };

  // Handle Delete action
  const handleDelete = (requestId) => {
    alert(`Deleted request with ID: ${requestId}`);
    // Add backend logic to delete the request
  };

  return (
    <div className="cfa-content">
      <h2>Fertilizer Request History</h2>
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
                  <th>Fertilizer Type</th>
                  <th>Packet Type</th>
                  <th>Amount (Kilos)</th>
                  <th>Payment Option</th>
                  <th>Status</th>
                  {activeTab === "newRequests" && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((request) => (
                  <tr key={request.request_id}>
                    <td>{request.requestDate}</td>
                    <td>{request.userId}</td>
                    <td>{request.userName}</td>
                    <td>{request.fertilizerType}</td>
                    <td>{request.packetType}</td>
                    <td>{request.amount}</td>
                    <td>{request.paymentOption}</td>
                    <td>
                      <span className={`status ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    {activeTab === "newRequests" && (
                      <td>
                        <button
                          className="confirm-button"
                          onClick={() => handleConfirm(request.request_id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(request.request_id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
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