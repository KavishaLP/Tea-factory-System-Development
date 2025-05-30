import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation to track current path
import { FaHome, FaHandHoldingUsd, FaLeaf, FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar3 = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get the current path

    const handleLogout = () => {
        localStorage.clear(); // Clear all local storage items
        localStorage.removeItem("userRole");
        localStorage.removeItem("token");
        navigate("/"); // Redirect to login page
        setTimeout(() => {
                window.location.reload(true);
        }, 100);
    };

    // Function to determine if the current path matches the route
    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div 
    className={`sidebar-item-custom ${isActive("/dashboard-farmer") ? "active" : ""}`} 
    onClick={() => navigate("/dashboard-farmer")}
>
    <FaHome className="sidebar-icon" /> <p>Dashboard</p>
</div>
            <div 
                className={`sidebar-item-custom ${isActive("/request-advance") ? "active" : ""}`} 
                onClick={() => navigate("/request-advance")}
            >
                <FaHandHoldingUsd className="sidebar-icon" /> <p>Request Advance</p>
            </div>
            <div 
                className={`sidebar-item-custom ${isActive("/request-fertilizer") ? "active" : ""}`} 
                onClick={() => navigate("/request-fertilizer")}
            >
                <FaLeaf className="sidebar-icon" /> <p>Request Fertilizer</p>
            </div>
            <div 
                className={`sidebar-item-custom ${isActive("/view-payment") ? "active" : ""}`} 
                onClick={() => navigate("/view-payment")}
            >
                <FaMoneyBillWave className="sidebar-icon" /> <p>View Payments</p>
            </div>
            <div 
                className="sidebar-item-custom logout" 
                onClick={handleLogout}
            >
                <FaSignOutAlt className="sidebar-icon" /> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar3;
