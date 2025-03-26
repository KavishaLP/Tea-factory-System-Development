import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaHandHoldingUsd, FaLeaf, FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar3 = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userRole"); // Clear stored user role
        navigate("/"); // Redirect to login page
    };
    

    return (
        <div className="sidebar">
            <div className="sidebar-item-custom active" onClick={() => navigate("/dashboard")}> 
                <FaHome className="sidebar-icon" /> <p>Dashboard</p>
            </div>
            <div className="sidebar-item-custom" onClick={() => navigate("/request-advance")}> 
                <FaHandHoldingUsd className="sidebar-icon" /> <p>Request Advance</p>
            </div>
            <div className="sidebar-item-custom" onClick={() => navigate("/request-fertilizer")}> 
                <FaLeaf className="sidebar-icon" /> <p>Request Fertilizer</p>
            </div>
            <div className="sidebar-item-custom" onClick={() => navigate("/view-payment")}>
                <FaMoneyBillWave className="sidebar-icon" /> <p>View Payments</p>
            </div>
            <div className="sidebar-item-custom logout" onClick={handleLogout}> 
                <FaSignOutAlt className="sidebar-icon" /> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar3;
