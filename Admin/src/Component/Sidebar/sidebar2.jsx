import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { FaHome, FaLeaf, FaHandHoldingUsd, FaBox, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar2 = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    const handleLogout = () => {
        localStorage.removeItem("userRole"); // Clear stored user role
        navigate("/"); // Redirect to login page
    };

    // Function to check if a route is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="sidebar">
            <div
                className={`sidebar-item ${isActive("/admin-dashboard-admin") ? "active" : ""}`}
                onClick={() => navigate("/admin-dashboard-admin")}
            >
                <FaHome className="sidebar-icon" /> <p>Dashboard</p>
            </div>
            <div
                className={`sidebar-item ${isActive("/tea-sack-update") ? "active" : ""}`}
                onClick={() => navigate("/tea-sack-update")}
            >
                <FaLeaf className="sidebar-icon" /> <p>Tea Sack Update</p>
            </div>
            <div
                className={`sidebar-item ${isActive("/advance-update") ? "active" : ""}`}
                onClick={() => navigate("/advance-update")}
            >
                <FaHandHoldingUsd className="sidebar-icon" /> <p>Advance Update</p>
            </div>
            <div
                className={`sidebar-item ${isActive("/tea-packet-distribution") ? "active" : ""}`}
                onClick={() => navigate("/tea-packet-distribution")}
            >
                <FaBox className="sidebar-icon" /> <p>Tea Packet Distribution</p>
            </div>
            <div
                className={`sidebar-item ${isActive("/settings") ? "active" : ""}`}
                onClick={() => navigate("/settings")}
            >
                <FaCog className="sidebar-icon" /> <p>Settings</p>
            </div>
            <div className="sidebar-item logout" onClick={handleLogout}>
                <FaSignOutAlt className="sidebar-icon" /> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar2;