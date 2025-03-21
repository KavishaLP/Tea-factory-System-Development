import React, { useEffect, useState } from "react";
import "./DashboardAdmin.css";
import Navbar from '../../Component/Navbar/Navbar2';
import Sidebar from '../../Component/sidebar/sidebar2';
import axios from "axios"; // Import axios for API calls

const DashboardAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState(0); // State to store pending requests count
  const [totalUsers, setTotalUsers] = useState(0); // State to store total users count
  const [totalPayments, setTotalPayments] = useState(0); // State to store total payments

  // Fetch pending requests from the backend
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/admin/fetch-pending-requests", {
          withCredentials: true, // Include credentials if needed
        });
        setPendingRequests(response.data.count); // Update state with the count of pending requests
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Fetch total number of users from the backend
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/admin/fetch-total-users", {
          withCredentials: true, // Include credentials if needed
        });
        setTotalUsers(response.data.totalUsers); // Update state with the total number of users
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };

    fetchTotalUsers();
  }, []);

  // Fetch total payments from the backend
  useEffect(() => {
    const fetchTotalPayments = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/admin/fetch-total-payments", {
          withCredentials: true, // Include credentials if needed
        });
        setTotalPayments(response.data.totalPayments); // Update state with the total payments
      } catch (error) {
        console.error("Error fetching total payments:", error);
      }
    };

    fetchTotalPayments();
  }, []);

  return (
    <div className="admin-dashboard">
       <Navbar />
       <Sidebar />
      
      <div className="main-content">
        <h1>Welcome to the Admin Dashboard</h1>
        <div className="cards">
          <div className="card">
            <h2>Total Users</h2>
            <p>{totalUsers}</p> {/* Display the fetched total users count */}
          </div>
          <div className="card">
            <h2>Total Payments</h2>
            <p>${totalPayments}</p> {/* Display the fetched total payments */}
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