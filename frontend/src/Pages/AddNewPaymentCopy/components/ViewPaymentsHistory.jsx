import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewPaymentsHistory() {
    const [filters, setFilters] = useState({
        userId: "",
        year: "",
        month: ""
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [paymentsHistory, setPaymentHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Fetch payment history when component mounts or filters change
    useEffect(() => {
        fetchViewHistory();
    }, [filters.year, filters.month]);

    // Apply filters whenever paymentsHistory, filters, or searchTerm changes
    useEffect(() => {
        applyFilters();
    }, [paymentsHistory, filters, searchTerm]);

    const fetchViewHistory = async () => {
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
                setPaymentHistory([]);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            setPaymentHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            userId: "",
            year: "",
            month: ""
        });
        setSearchTerm("");
    };

    const applyFilters = () => {
        let filtered = [...paymentsHistory];

        if (filters.year) {
            filtered = filtered.filter(payment => 
                new Date(payment.created_at).getFullYear() === parseInt(filters.year)
            );
        }

        if (filters.month) {
            filtered = filtered.filter(payment => 
                new Date(payment.created_at).getMonth() + 1 === parseInt(filters.month)
            );
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



    return (
        <div className="payment-history">

            <div className="filter-section">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="filter-select"
                >
                    <option value="">Select Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    className="filter-select"
                >
                    <option value="">Select Month</option>
                    {monthNames.map((month, index) => (
                        <option key={index + 1} value={index + 1}>{month}</option>
                    ))}
                </select>
                <button 
                    onClick={resetFilters}
                    className="reset-button"
                >
                    Reset Filters
                </button>
            </div>

            {historyLoading ? (
                <div className="loading-message">Loading payment history...</div>
            ) : filteredHistory.length > 0 ? (
                <table className="payment-table">
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
                <div className="no-results">
                    No payment records found for the selected filters.
                </div>
            )}
        </div>
    );
}

export default ViewPaymentsHistory;