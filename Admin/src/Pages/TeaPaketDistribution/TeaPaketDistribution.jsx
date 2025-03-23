//TeaPacketDistribution.jsx


import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TeaPaketDistribution.css";

const TeaPacketDistribution = () => {
  const [activeTab, setActiveTab] = useState("newRequests"); // Tabs: newRequests, confirmedRequests, or deletedRequests
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [requests, setRequests] = useState([]); // State to store fetched requests
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Fetch data on component mount or when the active tab changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(""); // Clear any previous errors
      try {
        const data = await fetchFertilizerRequests();
        console.log("Fetched Data:", data); // Log the fetched data
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

  // Fetch fertilizer requests from the backend
  const fetchFertilizerRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/get-tea-packets-requests",
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

  // Handle Confirm action
  const handleConfirm = async (requestId) => {
    setError(""); // Clear any previous errors
    try {
      await confirmRequest(requestId);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.request_id === requestId ? { ...request, status: "Approved" } : request
        )
      );
      alert("Request confirmed successfully!");
    } catch (error) {
      setError("Failed to confirm request. Please try again.");
      console.error("Error confirming request:", error);
    }
  };

  // Confirm a fertilizer request
  const confirmRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-tea-packets",
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

  // Handle Delete action
  const handleDelete = async (requestId) => {
    setError(""); // Clear any previous errors
    try {
      await deleteRequest(requestId);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.request_id === requestId ? { ...request, status: "Rejected" } : request
        )
      );
      alert("Request deleted successfully!");
    } catch (error) {
      setError("Failed to delete request. Please try again.");
      console.error("Error deleting request:", error);
    }
  };

  // Delete a fertilizer request
  const deleteRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/delete-tea-packets",
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

  // Filter data based on search term, date, and status
  const filteredData = requests
    .filter((request) => {
      // Skip undefined or invalid objects
      if (!request || !request.userId || !request.userName) {
        return false;
      }

      // Filter by search term
      const matchesSearchTerm =
        request.userId.includes(searchTerm) ||
        request.userName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by date
      const matchesDate = filterDate ? request.requestDate === filterDate : true;

      // Filter by status based on the active tab
      const matchesStatus =
        activeTab === "newRequests"
          ? request.status === "Pending" // Show pending requests for "New Requests" tab
          : activeTab === "confirmedRequests"
          ? request.status === "Approved" // Show approved requests for "Confirmed Requests" tab
          : request.status === "Rejected"; // Show rejected requests for "Deleted Requests" tab

      return matchesSearchTerm && matchesDate && matchesStatus;
    });

  return (
    <div className="tpd-content">
      <div className="tpd-grid">
      <h2>Fertilizer Request History</h2>
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

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* History Table */}
          <div className="table-container">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredData.length === 0 ? (
              <p>No requests found.</p>
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

export default TeaPacketDistribution;