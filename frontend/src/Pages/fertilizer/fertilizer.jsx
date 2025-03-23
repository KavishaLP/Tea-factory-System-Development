import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Fertilizer.css";

const Fertilizer = () => {
  const [activeTab, setActiveTab] = useState("newRequests"); // Tabs: newRequests, confirmedRequests, or deletedRequests
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [requests, setRequests] = useState([]); // State to store fetched requests
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch data on component mount or when the active tab changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchFertilizerRequests();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Filter data based on search term, date, and status
  const filteredData = requests.filter((request) => {
    const matchesSearchTerm =
      request.userId.includes(searchTerm) ||
      request.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? request.requestDate === filterDate : true;
    const matchesStatus =
      activeTab === "newRequests"
        ? request.status === "Pending"
        : activeTab === "confirmedRequests"
        ? request.status === "Completed"
        : request.status === "Deleted";
    return matchesSearchTerm && matchesDate && matchesStatus;
  });

  // Handle Confirm action
  const handleConfirm = async (requestId) => {
    try {
      const updatedRequest = await confirmRequest(requestId);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.request_id === requestId ? updatedRequest : request
        )
      );
      alert("Request confirmed successfully!");
    } catch (error) {
      alert("Failed to confirm request. Please try again.");
    }
  };

  // Handle Delete action
  const handleDelete = async (requestId) => {
    try {
      const updatedRequest = await deleteRequest(requestId);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.request_id === requestId ? updatedRequest : request
        )
      );
      alert("Request deleted successfully!");
    } catch (error) {
      alert("Failed to delete request. Please try again.");
    }
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
            <button
              className={`tab-button ${activeTab === "deletedRequests" ? "active" : ""}`}
              onClick={() => setActiveTab("deletedRequests")}
            >
              Deleted Requests
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
            {isLoading ? (
              <p>Loading...</p>
            ) : (
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
            )}
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