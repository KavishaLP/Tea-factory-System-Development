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
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredHistory]);

    const fetchViewHistory = async () => {
        try {
            setHistoryLoading(true);
            const requestData = {};
            if (filters.year) requestData.year = filters.year;
            if (filters.month) requestData.month = filters.month;

            const response = await axios.post(
                'http://localhost:8081/api/manager/fetch-Payment-History',
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

    const openDetailsPopup = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsPopup(true);
    };

    const closeDetailsPopup = () => {
        setShowDetailsPopup(false);
        setSelectedPayment(null);
    };

    const formatCurrency = (value) => {
        return parseFloat(value || 0).toFixed(2);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredHistory.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

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
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading payment history...</p>
                </div>
            ) : filteredHistory.length > 0 ? (
                <div>
                    <div className="table-responsive">
                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Tea Kilos</th>
                                    <th>Rate/kg</th>
                                    <th>Amount</th>
                                    <th>Advances</th>
                                    <th>Final Payment</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((payment, index) => (
                                    <tr key={index}>
                                        <td>{payment.userId}</td>
                                        <td>{formatCurrency(payment.finalTeaKilos)}</td>
                                        <td>{formatCurrency(payment.paymentPerKilo)}</td>
                                        <td>{formatCurrency(payment.finalAmount)}</td>
                                        <td>{formatCurrency(payment.advances)}</td>
                                        <td>{formatCurrency(payment.finalPayment)}</td>
                                        <td>{new Date(payment.created_at).toLocaleDateString('en-US')}</td>
                                        <td>
                                            <button 
                                                className="view-details-btn"
                                                onClick={() => openDetailsPopup(payment)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredHistory.length > itemsPerPage && (
                        <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="page-btn"
                            >
                                &laquo;
                            </button>
                            
                            {pageNumbers.map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`page-btn ${currentPage === number ? 'active' : ''}`}
                                >
                                    {number}
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(filteredHistory.length / itemsPerPage)}
                                className="page-btn"
                            >
                                &raquo;
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-results">
                    No payment records found for the selected filters.
                </div>
            )}

            {/* Payment Details Popup */}
            {showDetailsPopup && selectedPayment && (
                <div className="popup-overlay">
                    <div className="payment-details-popup">
                        <div className="popup-header">
                            <h3>Payment Details</h3>
                            <button className="close-popup" onClick={closeDetailsPopup}>&times;</button>
                        </div>
                        <div className="popup-content">
                            <div className="details-grid">
                                <div className="details-section">
                                    <h4>Basic Information</h4>
                                    <div className="detail-row">
                                        <span className="detail-label">User ID:</span>
                                        <span className="detail-value">{selectedPayment.userId}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Date:</span>
                                        <span className="detail-value">
                                            {new Date(selectedPayment.created_at).toLocaleDateString("en-US", {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="details-section">
                                    <h4>Tea Production</h4>
                                    <div className="detail-row">
                                        <span className="detail-label">Final Tea Kilos:</span>
                                        <span className="detail-value">{formatCurrency(selectedPayment.finalTeaKilos)} kg</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Payment Per Kilo:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.paymentPerKilo)}</span>
                                    </div>
                                    <div className="detail-row highlight">
                                        <span className="detail-label">Tea Payment Amount:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.paymentForFinalTeaKilos)}</span>
                                    </div>
                                </div>

                                <div className="details-section">
                                    <h4>Additions</h4>
                                    <div className="detail-row">
                                        <span className="detail-label">Additional Payments:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.additionalPayments)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Transport:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.transport)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Direct Payments:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.directPayments)}</span>
                                    </div>
                                </div>

                                <div className="details-section">
                                    <h4>Deductions</h4>
                                    <div className="detail-row">
                                        <span className="detail-label">Advances:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.advances)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Tea Packets:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.teaPackets)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Fertilizer:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.fertilizer)}</span>
                                    </div>
                                </div>

                                <div className="details-section full-width">
                                    <div className="detail-row final-payment">
                                        <span className="detail-label">Final Payment:</span>
                                        <span className="detail-value">Rs. {formatCurrency(selectedPayment.finalPayment)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewPaymentsHistory;