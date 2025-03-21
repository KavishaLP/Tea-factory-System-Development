import React, { useEffect, useState } from "react";
import "./DashboardAdmin.css";
import Navbar from '../../Component/Navbar/Navbar2';
import Sidebar from '../../Component/sidebar/sidebar2';
import axios from "axios"; // Import axios for API calls

const DashboardAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState(0); // State to store pending requests count

  // Fetch pending requests from the backend
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/admin/pending-requests", {
          withCredentials: true, // Include credentials if needed
        });
        setPendingRequests(response.data.count); // Update state with the count of pending requests
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();
  }, []); // Empty dependency array ensures this runs only once on component mount

  return (
    <div className="admin-dashboard">
       <Navbar />
       <Sidebar />
      
      <div className="main-content">
        <h1>Welcome to the Admin Dashboard</h1>
        <div className="cards">
          <div className="card">
            <h2>Total Users</h2>
            <p>150</p>
          </div>
          <div className="card">
            <h2>Total Payments</h2>
            <p>$5,000</p>
          </div>
          <div className="card">
            <h2>Pending Requests</h2>
            <p>{pendingRequests}</p> {/* Display the fetched pending requests count */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;