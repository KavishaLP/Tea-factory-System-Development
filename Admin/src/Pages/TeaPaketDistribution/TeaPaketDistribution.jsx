import React, { useState } from "react";
import "./TeaPaketDistribution.css"; // Ensure the CSS file is imported
import Navbar from '../../Component/Navbar/Navbar2'; // Import Navbar
import Sidebar from '../../Component/sidebar/sidebar2'; // Import Sidebar

const TeaPacketDistribution = () => {
  const [userId, setUserId] = useState("");
  const [packetType, setPacketType] = useState("");
  const [packetCount, setPacketCount] = useState(0);
  const [total, setTotal] = useState(0);

  const handleAdd = () => {
    // Logic to add the tea packet distribution
    alert(`Added ${packetCount} packets of ${packetType} for User ID: ${userId}`);
    // Reset fields after adding
    setUserId("");
    setPacketType("");
    setPacketCount(0);
  };

  return (
    <div className="tea-packet-container">
      <Navbar /> {/* Include Navbar */}
      <Sidebar /> {/* Include Sidebar */}
      <div className="content-wrapper">
        <div className="content">
          <div className="page-header">
            <h1>Tea Packet Distribution</h1>
          </div>

          <div className="search-section">
            <label>Search User Id Here</label>
            <input
              type="text"
              placeholder="🔍"
              className="search-input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label>User Id</label>
            <input
              type="text"
              className="input-field"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />

            <label>Type Of Tea Packet</label>
            <select
              className="input-field"
              value={packetType}
              onChange={(e) => setPacketType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="black-tea">Black Tea</option>
              <option value="green-tea">Green Tea</option>
            </select>

            <label>Number Of Tea Packets</label>
            <input
              type="number"
              className="input-field"
              value={packetCount}
              onChange={(e) => setPacketCount(e.target.value)}
            />

            <button className="add-button" onClick={handleAdd}>
              Add
            </button>
          </div>

          <div className="total-section">
            <label className="total-label">Total</label>
            <input type="text" className="total-input" value={total} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeaPacketDistribution;
