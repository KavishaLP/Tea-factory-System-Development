import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./Employeepayment.css";

function Employeepayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [formData, setFormData] = useState({
    userId: "",
    salaryAmount: "",
    additionalPayments: "",
    deductions: "",
    finalPayment: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsHistory, setPaymentHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: "",
    year: "",
    month: ""
  });

  // Get current year and month for default filter values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  // Function to fetch payment history
  useEffect(() => {
    if (activeTab === "viewHistory") {
      const fetchPaymentHistory = async () => {
        try {
          setHistoryLoading(true);
          const response = await axios.post(
            'http://localhost:8081/api/manager/get-Employee-Payment-History', 
            {}, 
            { withCredentials: true }
          );
          
          if (response.data.Status === 'Success') {
            setPaymentHistory(response.data.paymentHistory);
            setFilteredHistory(response.data.paymentHistory);
          } else {
            console.error('Failed to fetch payment history');
          }
        } catch (error) {
          console.error('Error fetching payment history:', error);
        } finally {
          setHistoryLoading(false);
        }
      };
  
      fetchPaymentHistory();
    }
  }, [activeTab]);

  // Apply filters whenever filters or paymentsHistory change
  useEffect(() => {
    if (activeTab === "viewHistory") {
      applyFilters();
    }
  }, [filters, paymentsHistory, activeTab]);

  const applyFilters = () => {
    let result = [...paymentsHistory];

    if (filters.userId) {
      result = result.filter(payment => 
        payment.userId.toString().includes(filters.userId)
      );
    }

    if (filters.year) {
      result = result.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getFullYear().toString() === filters.year;
      });
    }

    if (filters.month) {
      result = result.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return (paymentDate.getMonth() + 1).toString().padStart(2, '0') === filters.month;
      });
    }

    setFilteredHistory(result);
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
    setFilteredHistory(paymentsHistory);
  };

  // Handle change for input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name !== "userId" && value !== "" && !/^\d*\.?\d*$/.test(value)) {
      setError("Please enter a valid positive number");
      return;
    }

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      const salary = parseFloat(updatedData.salaryAmount) || 0;
      const additional = parseFloat(updatedData.additionalPayments) || 0;
      const deductions = parseFloat(updatedData.deductions) || 0;

      updatedData.finalPayment = (salary + additional - deductions).toFixed(2);

      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.userId || !formData.salaryAmount) {
      setError("User ID and Salary Amount are required");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:8081/api/manager/add-Employee-Payment",
        formData,
        { withCredentials: true }
      );
  
      if (response.data && response.data.status === "Success") {
        alert("Payment added successfully!");
        setFormData({
          userId: "",
          salaryAmount: "",
          additionalPayments: "",
          deductions: "",
          finalPayment: "",
        });
      } else {
        setError(response.data.error || "Failed to add payment.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate years for dropdown (last 5 years)
  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  return (
    <div className="cfa-content">
      <h2>Payment Management</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "addPayment" ? "active" : ""}`}
            onClick={() => setActiveTab("addPayment")}
          >
            Add New Employee Payment
          </button>
          <button
            className={`tab-button ${activeTab === "viewHistory" ? "active" : ""}`}
            onClick={() => setActiveTab("viewHistory")}
          >
            View Payments History
          </button>
        </div>

        {/* Add New Payment Form */}
        {activeTab === "addPayment" && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                placeholder="Enter user ID"
              />
            </div>

            <div className="input-group">
              <label>Salary Amount</label>
              <input
                type="text"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleChange}
                required
                placeholder="Enter salary amount"
              />
            </div>

            <div className="input-group">
              <label>Additional Payments</label>
              <input
                type="text"
                name="additionalPayments"
                value={formData.additionalPayments}
                onChange={handleChange}
                placeholder="Enter additional payments"
              />
            </div>

            <div className="input-group">
              <label>Deductions</label>
              <input
                type="text"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                placeholder="Enter deductions"
              />
            </div>

            <div className="input-group">
              <label>Final Payment</label>
              <input
                type="text"
                name="finalPayment"
                value={formData.finalPayment}
                readOnly
                placeholder="Calculated final payment"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {/* View Payments History Table */}
        {activeTab === "viewHistory" && (
          <div className="payment-history">
            <h3>Payment History</h3>
            
            {/* Filter Controls */}
            <div className="filter-controls">
              <div className="filter-group">
                <label>Search by User ID:</label>
                <input
                  type="text"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  placeholder="Enter user ID"
                />
              </div>
              
              <div className="filter-group">
                <label>Filter by Year:</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option>
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Filter by Month:</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  disabled={!filters.year}
                >
                  <option value="">All Months</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              
              <button 
                type="button" 
                onClick={resetFilters}
                className="reset-filters"
              >
                Reset Filters
              </button>
            </div>

            {historyLoading ? (
              <p>Loading...</p>
            ) : filteredHistory.length > 0 ? (
              <>
                <div className="results-count">
                  Showing {filteredHistory.length} of {paymentsHistory.length} records
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Salary Amount</th>
                        <th>Additional Payments</th>
                        <th>Deductions</th>
                        <th>Final Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((payment, index) => (
                        <tr key={index}>
                          <td>{payment.userId}</td>
                          <td>{payment.salaryAmount}</td>
                          <td>{payment.additionalPayments || '0'}</td>
                          <td>{payment.deductions || '0'}</td>
                          <td>{payment.finalPayment}</td>
                          <td>{new Date(payment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No payment history found matching your filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Employeepayment;