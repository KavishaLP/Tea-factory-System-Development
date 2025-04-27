import React, { useState } from "react";
import "./Copyaddnewpayment.css";

function Copyaddnewpayment() {
    const [activeTab, setActiveTab] = useState("addPayment");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const [paymentsHistory, setPaymentHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // For month/year navigation
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // For filters
    const [filters, setFilters] = useState({
        userId: "",
        year: "",
        month: ""
    });

    const [toPaymentsFilters, setToPaymentsFilters] = useState({
        year: "",
        month: "",
    });

    const [viewHistoryFilters, setViewHistoryFilters] = useState({
        year: "",
        month: "",
    });

    const [formData, setFormData] = useState({
        userId: "",
        paymentPerKilo: "",
        finalTeaKilos: "",
        paymentForFinalTeaKilos: "",
        additionalPayments: "",
        transport: "",
        directPayments: "",
        finalAmount: "",
        advances: "",
        teaPackets: "",
        fertilizer: "",
        finalPayment: "",
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // User suggestion functions
    const handleUserIdChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, userId: value }));

        if (value.length >= 2) {
            // In a real app, this would fetch suggestions from backend
            setUserSuggestions([]);
            setShowSuggestions(true);
        } else {
            setUserSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Calculation effects
    const handleChange = (e) => {
        const { name, value } = e.target;
        const positiveNumberPattern = /^\d*\.?\d*$/;

        if (name !== "userId" && value !== "" && !positiveNumberPattern.test(value)) {
            setError("Please enter a valid positive number");
            return;
        } else {
            setError("");
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Recalculate dependent fields
        if (name === "paymentPerKilo" || name === "finalTeaKilos") {
            const paymentForFinalTeaKilos = parseFloat(formData.paymentPerKilo || 0) * parseFloat(formData.finalTeaKilos || 0);
            setFormData(prevData => ({
                ...prevData,
                paymentForFinalTeaKilos: paymentForFinalTeaKilos,
            }));
        }

        if (name === "paymentForFinalTeaKilos" || name === "additionalPayments" || name === "transport" || name === "directPayments") {
            const finalAmount =
                (parseFloat(formData.paymentForFinalTeaKilos) || 0) +
                (parseFloat(formData.additionalPayments) || 0) +
                (parseFloat(formData.transport) || 0) +
                (parseFloat(formData.directPayments) || 0);
            setFormData(prevData => ({
                ...prevData,
                finalAmount: finalAmount.toFixed(2),
            }));
        }

        if (name === "finalAmount" || name === "advances" || name === "teaPackets" || name === "fertilizer") {
            const totalDeductions =
                (parseFloat(formData.advances) || 0) +
                (parseFloat(formData.teaPackets) || 0) +
                (parseFloat(formData.fertilizer) || 0);
            const finalPayment = (parseFloat(formData.finalAmount) || 0) - totalDeductions;
            setFormData(prevData => ({
                ...prevData,
                finalPayment: finalPayment.toFixed(2),
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const positiveNumberPattern = /^\d+(\.\d+)?$/;

        if (
            !positiveNumberPattern.test(formData.finalTeaKilos) ||
            !positiveNumberPattern.test(formData.paymentPerKilo) ||
            !positiveNumberPattern.test(formData.additionalPayments) ||
            !positiveNumberPattern.test(formData.transport) ||
            !positiveNumberPattern.test(formData.directPayments) ||
            !positiveNumberPattern.test(formData.advances) ||
            !positiveNumberPattern.test(formData.teaPackets) ||
            !positiveNumberPattern.test(formData.fertilizer)
        ) {
            setError("Please enter valid positive numbers for all payment fields.");
            return;
        }

        setError("");
        setIsLoading(true);
        
        // In a real app, this would submit to backend
        console.log("Form would be submitted:", formData);
        setTimeout(() => {
            setIsLoading(false);
            alert("Payment added successfully (demo)!");
            setFormData({
                userId: "",
                finalTeaKilos: "",
                paymentPerKilo: "",
                paymentForFinalTeaKilos: "",
                additionalPayments: "",
                directPayments: "",
                finalPayment: "",
                advances: "",
                teaPackets: "",
                fertilizer: "",
                transport: "",
                finalAmount: "",
            });
        }, 1000);
    };

    const resetFilters = () => {
        setFilters({
            userId: "",
            year: "",
            month: ""
        });
        setSearchTerm("");
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        // In a real app, this would filter data from backend
        setFilteredHistory([]);
    };

    const navigateToPaymentsMonth = (direction) => {
        setToPaymentsFilters((prevFilters) => {
            let newMonth = prevFilters.month ? parseInt(prevFilters.month) : currentMonth + 1;
            let newYear = prevFilters.year ? parseInt(prevFilters.year) : currentYear;

            if (direction === "prev") {
                if (newMonth === 1) {
                    newMonth = 12;
                    newYear -= 1;
                } else {
                    newMonth -= 1;
                }
            } else if (direction === "next") {
                if (newMonth === 12) {
                    newMonth = 1;
                    newYear += 1;
                } else {
                    newMonth += 1;
                }
            }

            return {
                year: newYear.toString(),
                month: newMonth.toString(),
            };
        });
    };

    const handleSuggestionClick = (userId) => {
        setFormData(prev => ({ ...prev, userId }));
        setUserSuggestions([]);
        setShowSuggestions(false);
        // In a real app, this would fetch user details
        setFormData(prev => ({
            ...prev,
            finalTeaKilos: "0",
            transport: "0",
            advances: "0"
        }));
    };

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
                        className={`tab-button ${activeTab === "addPayment" ? "active" : ""}`}
                        onClick={() => setActiveTab("addPayment")}
                    >
                        Add New Payment
                    </button>
                    <button
                        className={`tab-button ${activeTab === "viewHistory" ? "active" : ""}`}
                        onClick={() => setActiveTab("viewHistory")}
                    >
                        View Payments History
                    </button>
                </div>

                {/* To Payments Page */}
                {activeTab === "toPayment" && (
                    <div className="payment-history">
                        <div className="month-navigation">
                            <button onClick={() => navigateToPaymentsMonth("prev")}>&lt; Previous</button>
                            <h3>
                                {monthNames[toPaymentsFilters.month ? parseInt(toPaymentsFilters.month) - 1 : currentMonth]}{" "}
                                {toPaymentsFilters.year || currentYear}
                            </h3>
                            <button onClick={() => navigateToPaymentsMonth("next")}>Next &gt;</button>
                        </div>

                        {historyLoading ? (
                            <p>Loading...</p>
                        ) : paymentsHistory.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Final Tea Kilos</th>
                                        <th>Payment Per Kilo</th>
                                        <th>Final Amount</th>
                                        <th>Advances</th>
                                        <th>Final Payment</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentsHistory.map((payment, index) => (
                                        <tr key={index}>
                                            <td>{payment.userId}</td>
                                            <td>{payment.finalTeaKilos}</td>
                                            <td>{payment.paymentPerKilo}</td>
                                            <td>{payment.finalAmount}</td>
                                            <td>{payment.advances}</td>
                                            <td>{payment.finalPayment}</td>
                                            <td>{new Date(payment.created_at).toLocaleDateString("en-US")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No payment records found for {monthNames[currentMonth]} {currentYear}.</p>
                        )}
                    </div>
                )}

                {/* Add New Payment Form */}
                {activeTab === "addPayment" && (
                    <form onSubmit={handleSubmit}>
                        {error && <p className="error-message">{error}</p>}

                        <div className="input-group">
                            <label>User ID</label>
                            <input
                                type="text"
                                name="userId"
                                value={formData.userId}
                                onChange={handleUserIdChange}
                                required
                                placeholder="Start typing to search user IDs"
                                autoComplete="off"
                            />
                            {showSuggestions && userSuggestions.length > 0 && (
                                <ul className="suggestions-dropdown">
                                    {userSuggestions.map((userId, index) => (
                                        <li key={index} onClick={() => handleSuggestionClick(userId)}>
                                            {userId}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="input-group">
                            <label>Final Tea Kilos</label>
                            <input
                                type="text"
                                name="finalTeaKilos"
                                value={formData.finalTeaKilos}
                                onChange={handleChange}
                                required
                                placeholder="Enter final tea kilos"
                                readOnly
                            />
                        </div>

                        <div className="input-group">
                            <label>Payment For 1 Kilo</label>
                            <input
                                type="text"
                                name="paymentPerKilo"
                                value={formData.paymentPerKilo}
                                onChange={handleChange}
                                required
                                placeholder="Enter payment per kilo"
                            />
                        </div>

                        <div className="input-group">
                            <label>Payment For Final Tea Kilos</label>
                            <input
                                type="text"
                                name="paymentForFinalTeaKilos"
                                value={formData.paymentForFinalTeaKilos}
                                onChange={handleChange}
                                placeholder="Payment for final tea kilos"
                                readOnly
                            />
                        </div>

                        <div className="input-group">
                            <label>Additional Payments</label>
                            <div className="deduction-fields">
                                <input
                                    type="text"
                                    name="additionalPayments"
                                    value={formData.additionalPayments}
                                    onChange={handleChange}
                                    placeholder="Additional"
                                />
                                <input
                                    type="text"
                                    name="transport"
                                    value={formData.transport}
                                    onChange={handleChange}
                                    placeholder="Transport"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Direct Payments</label>
                            <input
                                type="text"
                                name="directPayments"
                                value={formData.directPayments}
                                onChange={handleChange}
                                placeholder="Enter direct payments"
                            />
                        </div>

                        <div className="input-group">
                            <label>Final Amount</label>
                            <input
                                type="text"
                                name="finalAmount"
                                value={formData.finalAmount}
                                onChange={handleChange}
                                placeholder="Enter final amount"
                                readOnly
                            />
                        </div>

                        <div className="input-group">
                            <label>Deductions</label>
                            <div className="deduction-fields">
                                <input
                                    type="text"
                                    name="advances"
                                    value={formData.advances}
                                    onChange={handleChange}
                                    placeholder="Advances"
                                />
                                <input
                                    type="text"
                                    name="teaPackets"
                                    value={formData.teaPackets}
                                    onChange={handleChange}
                                    placeholder="Tea Packets"
                                />
                                <input
                                    type="text"
                                    name="fertilizer"
                                    value={formData.fertilizer}
                                    onChange={handleChange}
                                    placeholder="Fertilizer"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Final Payment</label>
                            <input
                                type="text"
                                name="finalPayment"
                                value={formData.finalPayment}
                                onChange={handleChange}
                                placeholder="Final Payment"
                                readOnly
                            />
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding Payment..." : "Add Payment"}
                        </button>
                    </form>
                )}

                {/* View Payments History */}
                {activeTab === "viewHistory" && (
                    <div className="payment-history">
                        <div className="filter-section">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Year</option>
                                {[2023, 2024, 2025].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            <select
                                name="month"
                                value={filters.month}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Month</option>
                                {monthNames.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>{month}</option>
                                ))}
                            </select>
                            <button onClick={resetFilters}>Reset Filters</button>
                        </div>

                        {historyLoading ? (
                            <p>Loading...</p>
                        ) : filteredHistory.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Final Tea Kilos</th>
                                        <th>Payment Per Kilo</th>
                                        <th>Final Amount</th>
                                        <th>Advances</th>
                                        <th>Final Payment</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((payment, index) => (
                                        <tr key={index}>
                                            <td>{payment.userId}</td>
                                            <td>{payment.finalTeaKilos}</td>
                                            <td>{payment.paymentPerKilo}</td>
                                            <td>{payment.finalAmount}</td>
                                            <td>{payment.advances}</td>
                                            <td>{payment.finalPayment}</td>
                                            <td>{new Date().toLocaleDateString('en-US')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No payment records found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Copyaddnewpayment;