import React, { useState } from "react";
import "./AdvanceUpdate.css";

function AdvanceUpdate() {
  // Sample data for advance requests
  const [advanceRequests, setAdvanceRequests] = useState([
    { id: 1, userId: "F001", farmerName: "John Doe", advanceAmount: 5000, date: "2024-03-01" },
    { id: 2, userId: "F002", farmerName: "Jane Smith", advanceAmount: 3000, date: "2024-03-02" },
    { id: 3, userId: "F003", farmerName: "Alice Johnson", advanceAmount: 7000, date: "2024-03-03" },
  ]);

  // Function to confirm an advance request
  const handleConfirm = (id) => {
    setAdvanceRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== id)
    );
    alert(`Advance request ${id} confirmed successfully!`);
  };

  return (
    <div className="advance-update-container">
      <div className="page-header">
        <h1>Advance Requests</h1>
      </div>

      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Farmer Name</th>
              <th>Advance Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {advanceRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.userId}</td>
                <td>{request.farmerName}</td>
                <td>${request.advanceAmount}</td>
                <td>{request.date}</td>
                <td>
                  <button
                    className="confirm-button"
                    onClick={() => handleConfirm(request.id)}
                  >
                    Confirm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdvanceUpdate;