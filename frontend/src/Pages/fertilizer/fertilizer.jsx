import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FertilizerUpdate.css";

function FertilizerUpdate() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("newRequests");

  // State for fertilizer requests
  const [newRequests, setNewRequests] = useState([]);
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const [deletedRequests, setDeletedRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch fertilizer requests on component mount and tab change
  useEffect(() => {
    const fetchFertilizerRequests = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(
          "http://localhost:8081/api/admin/get-fertilizer-requests",
          { withCredentials: true }
        );
        console.log(response);
        if (response.data.status === "Success") {
          const requests = response.data.fertilizerRequests;
          setNewRequests(requests.filter((req) => req.status === "Pending"));
          setConfirmedRequests(requests.filter((req) => req.status === "Completed"));
          setDeletedRequests(requests.filter((req) => req.status === "Deleted"));
        } else {
          setError(response.data.message || "Failed to fetch fertilizer requests.");
        }
      } catch (error) {
        console.error("Error fetching fertilizer requests:", error);
        setError("An error occurred while fetching fertilizer requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFertilizerRequests();
  }, [activeTab]);

  // Function to confirm a fertilizer request
  const handleConfirm = async (id) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-fertilizer",
        { requestId: id },
        { withCredentials: true }
      );

      if (response.data.status === "Success") {
        // Find the confirmed request in newRequests
        const confirmedRequest = newRequests.find((req) => req.request_id === id);

        if (confirmedRequest) {
          // Remove the confirmed request from newRequests
          setNewRequests(newRequests.filter((req) => req.request_id !== id));

          // Add the confirmed request to confirmedRequests
          setConfirmedRequests([...confirmedRequests, { ...confirmedRequest, status: "Completed" }]);
        }

        alert("Fertilizer request confirmed successfully!");
      } else {
        setError(response.data.message || "Failed to confirm fertilizer request.");
      }
    } catch (error) {
      console.error("Error confirming fertilizer request:", error);
      setError("An error occurred while confirming the fertilizer request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a fertilizer request
  const handleDelete = async (id) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/delete-fertilizer",
        { requestId: id },
        { withCredentials: true }
      );

      if (response.data.status === "Success") {
        // Find the request being deleted
        const request = newRequests.find((req) => req.request_id === id);
        if (request) {
          // Move to deletedRequests and remove from newRequests
          setDeletedRequests([...deletedRequests, { ...request, status: "Deleted" }]);
          setNewRequests(newRequests.filter((req) => req.request_id !== id));
        }
        alert("Fertilizer request deleted successfully!");
      } else {
        setError(response.data.message || "Failed to delete fertilizer request.");
      }
    } catch (error) {
      console.error("Error deleting fertilizer request:", error);
      setError("An error occurred while deleting the fertilizer request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fertilizer-update-container">
      <div className="content-wrapper">
        <div className="content">
          <div className="page-header">
            <h1>Fertilizer Requests</h1>
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
                    <th>Fertilizer Type</th>
                    <th>Packet Type</th>
                    <th>Amount (Kilos)</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName + " " + request.lastName}</td>
                      <td>{request.fertilizerType}</td>
                      <td>{request.packetType}</td>
                      <td>{request.amount}</td>
                      <td>{request.requestDate}</td>
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
                    <th>Fertilizer Type</th>
                    <th>Packet Type</th>
                    <th>Amount (Kilos)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName + " " + request.lastName}</td>
                      <td>{request.fertilizerType}</td>
                      <td>{request.packetType}</td>
                      <td>{request.amount}</td>
                      <td>{request.requestDate}</td>
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
                    <th>Fertilizer Type</th>
                    <th>Packet Type</th>
                    <th>Amount (Kilos)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName + " " + request.lastName}</td>
                      <td>{request.fertilizerType}</td>
                      <td>{request.packetType}</td>
                      <td>{request.amount}</td>
                      <td>{request.requestDate}</td>
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

export default FertilizerUpdate;