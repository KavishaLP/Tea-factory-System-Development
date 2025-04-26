import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./addnewpayment.css";

function AddPayment() {
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

    // =============================================
    // To Payments functions ---------------------------------
    // =============================================

    // Separate month navigation for "To Payments"
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

    // Fetch payment history for "To Payments"
    const fetchToPaymentsHistory = async () => {
        try {
            setHistoryLoading(true);
            const requestData = {};
            if (toPaymentsFilters.year) requestData.year = toPaymentsFilters.year;
            if (toPaymentsFilters.month) requestData.month = toPaymentsFilters.month;

            const response = await axios.post(
                "http://localhost:8081/api/manager/get-Farmer-Payment-History",
                requestData,
                { withCredentials: true }
            );

            if (response.data.Status === "Success") {
                setPaymentHistory(response.data.paymentHistory);
            } else {
                setPaymentHistory([]);
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
            setPaymentHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // =============================================
    // Add New Payment functions ----------------------------
    // =============================================

    // User suggestion functions
    const fetchUserSuggestions = async (query) => {
        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/search-farmers-indb',
                { query },
                { withCredentials: true }
            );

            if (response.data.Status === 'Success') {
                setUserSuggestions(response.data.farmers.map(farmer => farmer.id));
            } else {
                setUserSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching user suggestions:', error);
            setUserSuggestions([]);
        }
    };

    const handleUserIdChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, userId: value }));

        if (value.length >= 2) {
            fetchUserSuggestions(value);
            setShowSuggestions(true);
        } else {
            setUserSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const fetchDEtailsRelatedTOUser = async (userId) => {
        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/get-details-related-to-user',
                { userId },
                { withCredentials: true }
            );

            if (response.data.Status === 'Success') {
                setFormData(prev => ({
                    ...prev,
                    finalTeaKilos: response.data.finalTeaKilos || "0",
                    transport: response.data.transport || "0",
                    advances: response.data.advances || "0"
                }));
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Failed to fetch details for this user');
        }
    };

    const handleSuggestionClick = (userId) => {
        setFormData(prev => ({ ...prev, userId }));
        setUserSuggestions([]);
        setShowSuggestions(false);
        fetchDEtailsRelatedTOUser(userId);
    };

    // Calculation effects
    useEffect(() => {
        const { paymentPerKilo, finalTeaKilos } = formData;
        if (paymentPerKilo && finalTeaKilos) {
            const paymentForFinalTeaKilos = parseFloat(paymentPerKilo) * parseFloat(finalTeaKilos);
            setFormData(prevData => ({
                ...prevData,
                paymentForFinalTeaKilos: paymentForFinalTeaKilos,
            }));
        }
    }, [formData.paymentPerKilo, formData.finalTeaKilos]);

    useEffect(() => {
        const { paymentForFinalTeaKilos, additionalPayments, transport, directPayments } = formData;
        if (paymentForFinalTeaKilos || additionalPayments || transport || directPayments) {
            const finalAmount =
                (parseFloat(paymentForFinalTeaKilos) || 0) +
                (parseFloat(additionalPayments) || 0) +
                (parseFloat(transport) || 0) +
                (parseFloat(directPayments) || 0);

            setFormData(prevData => ({
                ...prevData,
                finalAmount: finalAmount.toFixed(2),
            }));
        }
    }, [formData.paymentForFinalTeaKilos, formData.additionalPayments, formData.transport, formData.directPayments]);

    useEffect(() => {
        const { finalAmount, advances, teaPackets, fertilizer } = formData;
        const totalDeductions =
            (parseFloat(advances) || 0) +
            (parseFloat(teaPackets) || 0) +
            (parseFloat(fertilizer) || 0);

        const finalPayment = (parseFloat(finalAmount) || 0) - totalDeductions;

        setFormData(prevData => ({
            ...prevData,
            finalPayment: finalPayment.toFixed(2),
        }));
    }, [formData.finalAmount, formData.advances, formData.teaPackets, formData.fertilizer]);

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
    };

    const handleSubmit = async (e) => {
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

        try {
            const response = await axios.post(
                'http://localhost:8081/api/manager/add-Farmer-Payment',
                formData,
                { withCredentials: true }
            );

            if (response.data && response.data.Status === "Success") {
                alert("Payment added successfully!");
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
            } else {
                setError(response.data.Error || 'Failed to add payment. Please try again.');
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Server error. Please try again.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // =============================================
    // View Payments History functions ----------------------
    // =============================================

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
        let filtered = [...paymentsHistory];

        if (filters.year) {
            filtered = filtered.filter(payment => new Date(payment.created_at).getFullYear() === parseInt(filters.year));
        }

        if (filters.month) {
            filtered = filtered.filter(payment => new Date(payment.created_at).getMonth() + 1 === parseInt(filters.month));
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(payment => {
                const userId = String(payment.userId).toLowerCase();
                const finalTeaKilos = String(payment.finalTeaKilos).toLowerCase();
                const paymentPerKilo = String(payment.paymentPerKilo).toLowerCase();
                const finalAmount = String(payment.finalAmount).toLowerCase();
                const advances = String(payment.advances).toLowerCase();
                const finalPayment = String(payment.finalPayment).toLowerCase();
                const date = new Date(payment.created_at).toLocaleDateString('en-US').toLowerCase();

                return (
                    userId.includes(term) ||
                    finalTeaKilos.includes(term) ||
                    paymentPerKilo.includes(term) ||
                    finalAmount.includes(term) ||
                    advances.includes(term) ||
                    finalPayment.includes(term) ||
                    date.includes(term)
                );
            });
        }
        setFilteredHistory(filtered);
    };

    // Fetch payment history for "View Payments History"
    const fetchViewHistory = async () => {
        try {
            setHistoryLoading(true);
            const requestData = {};
            if (viewHistoryFilters.year) requestData.year = viewHistoryFilters.year;
            if (viewHistoryFilters.month) requestData.month = viewHistoryFilters.month;

            const response = await axios.post(
                'http://localhost:8081/api/manager/get-Farmer-Payment-History',
                requestData,
                { withCredentials: true }
            );

            if (response.data.Status === 'Success') {
                setFilteredHistory(response.data.paymentHistory);
            } else {
                setFilteredHistory([]);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            setFilteredHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // =============================================
    // Common functions and effects -------------------------
    // =============================================

    // Fetch current date on mount
    useEffect(() => {
        const date = new Date();
        const formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        setCurrentDate(formattedDate);
    }, []);

    // Fetch payment history when tab or filters change
    useEffect(() => {
        if (activeTab === "viewHistory" || activeTab === "toPayment") {
            fetchPaymentHistory();
        }
    }, [activeTab, filters.year, filters.month, currentMonth, currentYear]);

    const fetchPaymentHistory = async () => {
        try {
            setHistoryLoading(true);
            const requestData = {};
            if (filters.year) requestData.year = filters.year;
            if (filters.month) requestData.month = filters.month;

            const response = await axios.post(
                'http://localhost:8081/api/manager/get-Farmer-Payment-History',
                requestData,
                { withCredentials: true }
            );

            if (response.data.Status === 'Success') {
                setPaymentHistory(response.data.paymentHistory);
            } else {
                console.error('Failed to fetch payment history');
                setPaymentHistory([]);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            setPaymentHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [paymentsHistory, filters, searchTerm]);

    // Month navigation functions
    const navigateMonth = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(prev => prev - 1);
            } else {
                setCurrentMonth(prev => prev - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(prev => prev + 1);
            } else {
                setCurrentMonth(prev => prev + 1);
            }
        }

        setFilters(prev => ({
            ...prev,
            year: currentYear,
            month: currentMonth + 1,
        }));
    };

    // Call the respective fetch functions based on the active tab
    useEffect(() => {
        if (activeTab === "toPayment") {
            fetchToPaymentsHistory();
        } else if (activeTab === "viewHistory") {
            fetchViewHistory();
        }
    }, [activeTab, toPaymentsFilters, viewHistoryFilters]);

    // =============================================
    // Render Section ------------------------------
    // =============================================

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
                                {Array.from(new Set(paymentsHistory.map(payment => new Date(payment.created_at).getFullYear())))
                                    .sort((a, b) => b - a)
                                    .map(year => (
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
                                            <td>{new Date(payment.created_at).toLocaleDateString('en-US')}</td>
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

export default AddPayment;