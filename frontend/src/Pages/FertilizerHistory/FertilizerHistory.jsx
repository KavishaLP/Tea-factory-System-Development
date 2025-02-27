import React, { useState } from "react";
import "./FertilizerHistory.css";

const FertilizerHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  return (
    <div className="cfa-content">
      <h2>Fertilizer Distribution History</h2>
      <div className="cfa-grid">
        <div className="history-section">
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
                  <th>Amount (Kilos)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    <td>2024-03-{String(index + 1).padStart(2, '0')}</td>
                    <td>USR{String(index + 1).padStart(3, '0')}</td>
                    <td>Farmer {index + 1}</td>
                    <td>Type {(index % 3) + 1}</td>
                    <td>{(index + 1) * 5}</td>
                    <td>
                      <span className={`status ${index % 2 === 0 ? 'completed' : 'pending'}`}>
                        {index % 2 === 0 ? 'Completed' : 'Pending'}
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

export default FertilizerHistory;
