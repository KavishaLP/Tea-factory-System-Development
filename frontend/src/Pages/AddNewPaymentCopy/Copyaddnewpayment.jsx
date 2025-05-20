//pages/AddNewPaymentCopy/Copyaddnewpayment.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Copyaddnewpayment.css";
import ToPayments from "./components/ToPayments";
import ViewPaymentsHistory from "./components/ViewPaymentsHistory";

function Copyaddnewpayment() {
    const [activeTab, setActiveTab] = useState("toPayment");
    const [teaPrice, setTeaPrice] = useState(null);
    const [newTeaPrice, setNewTeaPrice] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    // Get current month and year in YYYY-MM format
    const getCurrentMonthYear = () => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    // Fetch current month's tea price
    const fetchTeaPrice = async () => {
        try {
            const monthYear = getCurrentMonthYear();
            const response = await axios.get(`http://localhost:8081/api/manager/fetch-tea-price?month_year=${monthYear}`);
            
            if (response.data.price) {
                // Ensure we're storing a number
                setTeaPrice(parseFloat(response.data.price));
                setNewTeaPrice(response.data.price);
            } else {
                setTeaPrice(null);
            }
        } catch (error) {
            console.error("Error fetching tea price:", error);
            setMessage({
                text: "Failed to load tea price. Please try again.",
                type: "error"
            });
        }
    };

    // Update tea price
    const handleUpdateTeaPrice = async () => {
        if (!newTeaPrice || isNaN(newTeaPrice) || parseFloat(newTeaPrice) <= 0) {
            setMessage({
                text: "Please enter a valid price (greater than zero).",
                type: "error"
            });
            return;
        }

        setLoading(true);
        try {
            const monthYear = getCurrentMonthYear();
            await axios.post("http://localhost:8081/api/manager/update-tea-price", {
                price: parseFloat(newTeaPrice),
                month_year: monthYear
            });

            setTeaPrice(parseFloat(newTeaPrice));
            setIsEditing(false);
            setMessage({
                text: "Tea price updated successfully!",
                type: "success"
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);
        } catch (error) {
            console.error("Error updating tea price:", error);
            setMessage({
                text: "Failed to update tea price. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeaPrice();
    }, []);

    const formatMonthYear = (monthYearStr) => {
        const [year, month] = monthYearStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setNewTeaPrice(teaPrice || "");
        setIsEditing(false);
    };

    return (
        <div className="cfa-content">
            <div className="header-section">
                <h2>Payment Management</h2>
            </div>
            
            {/* Tea kilo updating and view */}
            <div className="tea-price-section">
                <div className="tea-price-card">
                    <h3>Tea Price for {formatMonthYear(getCurrentMonthYear())}</h3>
                    
                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    
                    {!isEditing ? (
                        <div className="tea-price-display">
                            <div className="current-price">
                                {teaPrice !== null ? (
                                    <>
                                        <span className="price-label">Current Price:</span>
                                        <span className="price-value">Rs. {Number(teaPrice).toFixed(2)}/kg</span>
                                    </>
                                ) : (
                                    <span className="no-price">No price set for this month</span>
                                )}
                            </div>
                            <button 
                                className="edit-price-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                {teaPrice ? "Update Price" : "Set Price"}
                            </button>
                        </div>
                    ) : (
                        <div className="tea-price-edit">
                            <div className="price-input-group">
                                <label htmlFor="teaPrice">Enter Tea Price (Rs/kg)</label>
                                <input
                                    type="number"
                                    id="teaPrice"
                                    value={newTeaPrice}
                                    onChange={(e) => setNewTeaPrice(e.target.value)}
                                    placeholder="Enter price per kg"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="price-actions">
                                <button 
                                    className="save-price-btn"
                                    onClick={handleUpdateTeaPrice}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Price"}
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="cfa-grid">
                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === "toPayment" ? "active" : ""}`}
                        onClick={() => setActiveTab("toPayment")}
                    >
                        To Payments
                    </button>
                    <button
                        className={`tab-button ${activeTab === "viewHistory" ? "active" : ""}`}
                        onClick={() => setActiveTab("viewHistory")}
                    >
                        View Payments History
                    </button>
                </div>

                {/* Conditional rendering of components */}
                {activeTab === "toPayment" && <ToPayments teaPrice={teaPrice} />}
                {activeTab === "viewHistory" && <ViewPaymentsHistory />}
            </div>
        </div>
    );
}

export default Copyaddnewpayment;
