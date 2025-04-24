import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TeaPaketDistribution.css";

const TeaPacketDistribution = () => {
  const [activeTab, setActiveTab] = useState("newRequests");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchTeaPacketRequests();
        console.log("Fetched Data:", data);
        setRequests(data || []);
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", error);
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const fetchTeaPacketRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/get-tea-packet-requests",
        { withCredentials: true }
      );

      console.log("Backend Response:", response);

      if (response.data.status === "Success") {
        return response.data.teaPacketRequests || [];
      } else {
        throw new Error(response.data.message || "Failed to fetch tea packet requests.");
      }
    } catch (error) {
      console.error("Error fetching tea packet requests:", error);
      throw error;
    }
  };

  // ---------------------- CONFIRM ---------------------- //

  const handleConfirm = async (requestId) => {
    setError("");
    try {
      await confirmRequest(requestId);
      updateRequestStatus(requestId, "Approved");
      alert("Request confirmed successfully!");
    } catch (error) {
      setError("Failed to confirm request. Please try again.");
      console.error("Error confirming request:", error);
    }
  };

  const confirmRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-tea-packet",
        { requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to confirm request.");
      }
    } catch (error) {
      throw error;
    }
  };

  // ---------------------- DELETE ---------------------- //

  const handleDelete = async (requestId) => {
    setError("");
    try {
      await deleteRequest(requestId);
      updateRequestStatus(requestId, "Rejected");
      alert("Request deleted successfully!");
    } catch (error) {
      setError("Failed to delete request. Please try again.");
      console.error("Error deleting request:", error);
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/delete-tea-packet",
        { requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to delete request.");
      }
    } catch (error) {
      throw error;
    }
  };

  // ---------------------- CONFIRM DELETE REQUEST (New) ---------------------- //

  const handleConfirmDelete = async (requestId) => {
    setError("");
    try {
      await confirmDeleteRequest(requestId);
      updateRequestStatus(requestId, "Deleted");
      alert("Request confirm-deleted successfully!");
    } catch (error) {
      setError("Failed to confirm delete request. Please try again.");
      console.error("Error confirming delete request:", error);
    }
  };

  const confirmDeleteRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-delete-tea-packet",
        { requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to confirm delete request.");
      }
    } catch (error) {
      throw error;
    }
  };

  // ---------------------- UTIL ---------------------- //

  const updateRequestStatus = (requestId, newStatus) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.request_id === requestId ? { ...request, status: newStatus } : request
      )
    );
  };

  const filteredData = Array.isArray(requests)
    ? requests.filter((request) => {
        if (!request || !request.userId || !request.userName) return false;

        const matchesSearchTerm =
          request.userId.includes(searchTerm) ||
          request.userName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = filterDate ? request.requestDate === filterDate : true;

        const matchesStatus =
          activeTab === "newRequests"
            ? request.status === "Pending"
            : activeTab === "confirmedRequests"
            ? request.status === "Approved"
            : request.status === "Rejected" || request.status === "Deleted";

        return matchesSearchTerm && matchesDate && matchesStatus;
      })
    : [];

  return (
    <div className="tpd-content">
      <div className="tpd-grid">
        <h2>Tea Packet Request History</h2>
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
              Deleted Requests
            </button>
          </div>

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

          {error && <div className="error-message"><p>{error}</p></div>}

          <div className="table-container">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredData.length === 0 ? (
              <p>No tea packet requests found.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Tea Packet Type</th>
                    <th>Packet Size</th>
                    <th>Amount</th>
                    <th>Payment Option</th>
                    <th>Status</th>
                    {activeTab === "newRequests" && <th>Action</th>}
                    {activeTab === "deletedRequests" && <th>Confirm Delete</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((request) => (
                    <tr key={request.request_id}>
                      <td>{request.requestDate}</td>
                      <td>{request.userId}</td>
                      <td>{request.userName}</td>
                      <td>{request.teaPacketType}</td>
                      <td>{request.teaPacketSize}</td>
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
                      {activeTab === "deletedRequests" && (
                        <td>
                          <button
                            className="confirm-delete-button"
                            onClick={() => handleConfirmDelete(request.request_id)}
                          >
                            Confirm Delete
                          </button>
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

export default TeaPacketDistribution;
