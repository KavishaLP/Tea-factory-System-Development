import React, { useState } from 'react';

function ViewPaymentsHistory() {
    const [filters, setFilters] = useState({
        userId: "",
        year: "",
        month: ""
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHistory, setFilteredHistory] = useState([]);

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
        // In a real app, this would filter data from backend
        setFilteredHistory([]);
    };

    return (
        <div className="payment-filters">
            <div className="filter-inputs">
                <input
                    type="text"
                    name="userId"
                    placeholder="Filter by User ID"
                    value={filters.userId}
                    onChange={handleFilterChange}
                />
                <select name="year" value={filters.year} onChange={handleFilterChange}>
                    <option value="">Select Year</option>
                    {/* Dynamically generate year options */}
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <select name="month" value={filters.month} onChange={handleFilterChange}>
                    <option value="">Select Month</option>
                    {/* Dynamically generate month options */}
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{month}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="filter-buttons">
                <button onClick={applyFilters}>Apply Filters</button>
                <button onClick={resetFilters}>Reset Filters</button>
            </div>
        </div>
    );
}

export default ViewPaymentsHistory;
