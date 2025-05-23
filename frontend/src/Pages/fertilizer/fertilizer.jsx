import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Fertilizer.css";

const Fertilizer = () => {
  const [activeTab, setActiveTab] = useState("newRequests");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  
  // New filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    month: ""
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

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

  // Apply filters whenever filters or requests change
  useEffect(() => {
    applyFilters();
  }, [filters, requests, activeTab, searchTerm]);

  const fetchFertilizerRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/manager/get-fertilizer-requests",
        { withCredentials: true }
      );
      if (response.data.status === "Success") {
        return response.data.fertilizerRequests;
      }
      throw new Error(response.data.message || "Failed to fetch fertilizer requests.");
    } catch (error) {
      console.error("Error fetching fertilizer requests:", error);
      throw error;
    }
  };

  const applyFilters = () => {
    let result = [...requests];

    // Filter by year if selected
    if (filters.year) {
      result = result.filter(request => 
        new Date(request.requestDate).getFullYear() === parseInt(filters.year)
      );
    }

    // Filter by month if selected
    if (filters.month) {
      result = result.filter(request => 
        new Date(request.requestDate).getMonth() + 1 === parseInt(filters.month)
      );
    }

    // Search term filtering
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(request => 
        Object.entries(request).some(([key, value]) => {
          if (typeof value === "string" && ["userId", "userName", "fertilizerType", "packetType"].includes(key)) {
            return value.toLowerCase().includes(searchTermLower);
          }
          return false;
        })
      );
    }

    // Status filtering based on active tab
    result = result.filter(request => {
      return activeTab === "newRequests" ? request.status === "Pending" :
             activeTab === "confirmedRequests" ? request.status === "Approved" :
             request.status === "Rejected";
    });

    setFilteredRequests(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      year: "",
      month: ""
    });
    setSearchTerm("");
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
      await rejectRequest(requestId);
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

  const rejectRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/manager/delete-fertilizer",
        { requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to reject request.");
      }
    } catch (error) {
      throw error;
    }
  };

  // Get unique years from requests for year dropdown
  const getUniqueYears = () => {
    const years = new Set();
    requests.forEach(request => {
      const year = new Date(request.requestDate).getFullYear();
      if (!isNaN(year)) {
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

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

          {/* Updated Filter Section */}
          <div className="filter-section">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value="">Select Year</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
            >
              <option value="">Select Month</option>
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
            <button onClick={resetFilters}>Reset Filters</button>
          </div>

          {error && <div className="error-message"><p>{error}</p></div>}

          <div className="table-container">
            {isLoading ? (
              <p className="loading-message">Loading...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="no-data-message">No requests found.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="col-date">Date</th>
                    <th className="col-user-id">User ID</th>
                    <th className="col-user-name">User Name</th>
                    <th className="col-fertilizer-type">Fertilizer Type</th>
                    <th className="col-packet-type">Packet Type</th>
                    <th className="col-amount">Amount</th>
                    <th className="col-payment">Payment</th>
                    <th className="col-status">Status</th>
                    {activeTab === "newRequests" && <th className="col-actions">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <React.Fragment key={request.request_id}>
                      <tr className="clickable-row">
                        <td className="col-date">{formatDate(request.requestDate)}</td>
                        <td className="col-user-id">{request.userId}</td>
                        <td className="col-user-name">{request.userName}</td>
                        <td className="col-fertilizer-type">{request.fertilizerType}</td>
                        <td className="col-packet-type">{request.packetType}</td>
                        <td className="col-amount">{request.amount}</td>
                        <td className="col-payment">{request.paymentOption}</td>
                        <td className="col-status">
                          <span className={`status ${request.status.toLowerCase()}`}>
                            {request.status}
                          </span>
                        </td>
                        {activeTab === "newRequests" && (
                          <td className="col-actions">
                            <div className="action-buttons">
                              <button
                                className="confirm-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirm(request.request_id);
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                className="reject-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(request.request_id);
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
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