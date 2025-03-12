import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdvanceUpdate.css";

function AdvanceUpdate() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("newRequests");

  // State for advance requests
  const [newRequests, setNewRequests] = useState([]);
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const [deletedRequests, setDeletedRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch advance requests on component mount and tab change
  useEffect(() => {
    const fetchAdvanceRequests = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(
          "http://localhost:8081/api/admin/get-advance-requests",
          { withCredentials: true }
        );
        console.log(response)
        if (response.data.status === "Success") {
          const requests = response.data.advanceRequests;
          setNewRequests(requests.filter((req) => req.action === "Pending"));
          setConfirmedRequests(requests.filter((req) => req.action === "Approved"));
          setDeletedRequests(requests.filter((req) => req.action === "Rejected"));
        } else {
          setError(response.data.message || "Failed to fetch advance requests.");
        }
      } catch (error) {
        console.error("Error fetching advance requests:", error);
        setError("An error occurred while fetching advance requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvanceRequests();
  }, [activeTab]);

  // Function to confirm an advance request
  const handleConfirm = async (id) => {
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-advance",
        { advanceId: id },
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        // Find the confirmed request in newRequests
        const confirmedRequest = newRequests.find((req) => req.advn_id === id);
  
        if (confirmedRequest) {
          // Remove the confirmed request from newRequests
          setNewRequests(newRequests.filter((req) => req.advn_id !== id));
  
          // Add the confirmed request to confirmedRequests
          setConfirmedRequests([...confirmedRequests, { ...confirmedRequest, action: "Approved" }]);
        }
  
        alert("Advance request confirmed successfully!");
      } else {
        setError(response.data.message || "Failed to confirm advance request.");
      }
    } catch (error) {
      console.error("Error confirming advance request:", error);
      setError("An error occurred while confirming the advance request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete an advance request
  const handleDelete = async (id) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/delete-advance",
        { advanceId: id },
        { withCredentials: true }
      );

      if (response.data.status === "Success") {
        // Update state to move the request from newRequests to deletedRequests
        const request = newRequests.find((req) => req.id === id);
        if (request) {
          setDeletedRequests([...deletedRequests, { ...request, action: "Rejected" }]);
          setNewRequests(newRequests.filter((req) => req.id !== id));
        }
        alert("Advance request deleted successfully!");
      } else {
        setError(response.data.message || "Failed to delete advance request.");
      }
    } catch (error) {
      console.error("Error deleting advance request:", error);
      setError("An error occurred while deleting the advance request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="advance-update-container">
      <div className="content-wrapper">
        <div className="content">
          <div className="page-header">
            <h1>Advance Requests</h1>
          </div>

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

          {/* Loading and Error Messages */}
          {isLoading && <p className="loading">Loading...</p>}
          {error && <p className="error">{error}</p>}

          {/* New Requests Table */}
          {activeTab === "newRequests" && (
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Farmer Name</th>
                    <th>Advance Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newRequests.map((request) => (
                    <tr key={request.advn_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName +' '+ request.lastName}</td>
                      <td>${request.amount}</td>
                      <td>{request.date}</td>
                      <td>
                        <button
                          className="confirm-button"
                          onClick={() => handleConfirm(request.advn_id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(request.advn_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Confirmed Requests Table */}
          {activeTab === "confirmedRequests" && (
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Farmer Name</th>
                    <th>Advance Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName +' '+ request.lastName}</td>
                      <td>${request.amount}</td>
                      <td>{request.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Deleted Requests Table */}
          {activeTab === "deletedRequests" && (
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Farmer Name</th>
                    <th>Advance Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName +' '+ request.lastName}</td>
                      <td>${request.amount}</td>
                      <td>{request.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvanceUpdate;