import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Fertilizer.css";

const Fertilizer = () => {
  const [activeTab, setActiveTab] = useState("newRequests");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRequests, setSelectedRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchFertilizerRequests();
        setRequests(data);
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const fetchFertilizerRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/manager/get-fertilizer-requests",
        { withCredentials: true }
      );
      if (response.data.status === "Success") {
        return response.data.fertilizerRequests;
      } else {
        throw new Error(response.data.message || "Failed to fetch fertilizer requests.");
      }
    } catch (error) {
      console.error("Error fetching fertilizer requests:", error);
      throw error;
    }
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleBulkConfirm = async () => {
    if (selectedRequests.length === 0) {
      setError("Please select at least one request to confirm.");
      return;
    }

    try {
      await Promise.all(selectedRequests.map(requestId => confirmRequest(requestId)));
      setRequests(prevRequests =>
        prevRequests.map(request =>
          selectedRequests.includes(request.request_id)
            ? { ...request, status: "Approved" }
            : request
        )
      );
      setSelectedRequests([]);
      alert(`${selectedRequests.length} request(s) confirmed successfully!`);
    } catch (error) {
      setError("Failed to confirm requests. Please try again.");
      console.error("Error confirming requests:", error);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) {
      setError("Please select at least one request to reject.");
      return;
    }

    try {
      await Promise.all(selectedRequests.map(requestId => deleteRequest(requestId)));
      setRequests(prevRequests =>
        prevRequests.map(request =>
          selectedRequests.includes(request.request_id)
            ? { ...request, status: "Rejected" }
            : request
        )
      );
      setSelectedRequests([]);
      alert(`${selectedRequests.length} request(s) rejected successfully!`);
    } catch (error) {
      setError("Failed to reject requests. Please try again.");
      console.error("Error rejecting requests:", error);
    }
  };

  const handleConfirm = async (requestId) => {
    setError("");
    try {
      await confirmRequest(requestId);
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.request_id === requestId ? { ...request, status: "Approved" } : request
        )
      );
      alert("Request confirmed successfully!");
    } catch (error) {
      setError("Failed to confirm request. Please try again.");
      console.error("Error confirming request:", error);
    }
  };

  const handleReject = async (requestId) => {
    setError("");
    try {
      await deleteRequest(requestId);
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.request_id === requestId ? { ...request, status: "Rejected" } : request
        )
      );
      alert("Request rejected successfully!");
    } catch (error) {
      setError("Failed to reject request. Please try again.");
      console.error("Error rejecting request:", error);
    }
  };

  const confirmRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/manager/confirm-fertilizer",
        { requestId: requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to confirm request.");
      }
    } catch (error) {
      console.error("Error confirming request:", error);
      throw error;
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/manager/delete-fertilizer",
        { requestId: requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to delete request.");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  };

  const filteredData = requests
    .filter((request) => {
      if (!request || !request.userId || !request.userName) {
        return false;
      }

      const matchesSearchTerm =
        request.userId.includes(searchTerm) ||
        request.userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = filterDate ? request.requestDate === filterDate : true;

      const matchesStatus =
        activeTab === "newRequests"
          ? request.status === "Pending"
          : activeTab === "confirmedRequests"
          ? request.status === "Approved"
          : request.status === "Rejected";

      return matchesSearchTerm && matchesDate && matchesStatus;
    });

  return (
    <div className="cfa-content">
      <h2>Fertilizer Request History</h2>
      <div className="cfa-grid">
        <div className="history-section">
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
              Rejected Requests
            </button>
          </div>

          {activeTab === "newRequests" && (
            <div className="bulk-actions">
              <button 
                className="bulk-confirm-btn"
                onClick={handleBulkConfirm}
                disabled={selectedRequests.length === 0}
              >
                Confirm Selected ({selectedRequests.length})
              </button>
              <button 
                className="bulk-reject-btn"
                onClick={handleBulkReject}
                disabled={selectedRequests.length === 0}
              >
                Reject Selected ({selectedRequests.length})
              </button>
            </div>
          )}

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

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="table-container">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredData.length === 0 ? (
              <p>No requests found.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    {activeTab === "newRequests" && <th>Select</th>}
                    <th>Date</th>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Fertilizer Type</th>
                    <th>Packet Type</th>
                    <th>Amount</th>
                    <th>Payment Option</th>
                    <th>Status</th>
                    {activeTab === "newRequests" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((request) => (
                    <tr key={request.request_id}>
                      {activeTab === "newRequests" && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.request_id)}
                            onChange={() => handleSelectRequest(request.request_id)}
                          />
                        </td>
                      )}
                      <td>{request.requestDate}</td>
                      <td>{request.userId}</td>
                      <td>{request.userName}</td>
                      <td>{request.fertilizerType}</td>
                      <td>{request.packetType}</td>
                      <td>{request.amount} ({request.amount * parseInt(request.packetType)} kg)</td>
                      <td>{request.paymentOption}</td>
                      <td>
                        <span className={`status ${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      {activeTab === "newRequests" && (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="confirm-button"
                              onClick={() => handleConfirm(request.request_id)}
                            >
                              Confirm
                            </button>
                            <button
                              className="reject-button"
                              onClick={() => handleReject(request.request_id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

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