import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaLeaf, FaHandHoldingUsd, FaBox, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar2 = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userRole"); // Clear stored user role
        navigate("/"); // Redirect to login page
    };

    return (
        <div className="sidebar">
            <div className="sidebar-item active" onClick={() => navigate("/dashboard")}>
                <FaHome className="sidebar-icon" /> <p>Dashboard</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate("/teasack")}>
                <FaLeaf className="sidebar-icon" /> <p>Tea Sack Update</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate("/advance-update")}>
                <FaHandHoldingUsd className="sidebar-icon" /> <p>Advance Update</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate("/tea-packet-distribution")}>
                <FaBox className="sidebar-icon" /> <p>Tea Packet Distribution</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate("/settings")}>
                <FaCog className="sidebar-icon" /> <p>Settings</p>
            </div>
            <div className="sidebar-item logout" onClick={handleLogout}>
                <FaSignOutAlt className="sidebar-icon" /> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar2;
