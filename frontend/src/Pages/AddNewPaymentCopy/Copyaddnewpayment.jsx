import React, { useState } from "react";
import "./Copyaddnewpayment.css";
import ToPayments from "./components/ToPayments";
import ViewPaymentsHistory from "./components/ViewPaymentsHistory";

function Copyaddnewpayment() {
    const [activeTab, setActiveTab] = useState("toPayment");

    return (
        <div className="cfa-content">
            <div className="header-section">
                <h2>Payment Management</h2>
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
                {activeTab === "toPayment" && <ToPayments />}
                {activeTab === "viewHistory" && <ViewPaymentsHistory />}
            </div>
        </div>
    );
}

export default Copyaddnewpayment;
