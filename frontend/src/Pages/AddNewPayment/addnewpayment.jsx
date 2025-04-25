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
  
  
  // For month/year navigation
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // For filters
  const [filters, setFilters] = useState({
    userId: "",
    year: currentYear,
    month: currentMonth + 1
  });

  const [formData, setFormData] = useState({
    userId:"",
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

  const resetFilters = () => {
    setFilters({
      userId: "",
      year: "",
      month: ""
    });
    setFilteredHistory(paymentsHistory);
  };

  // Fetch current date on mount
  useEffect(() => {
    const date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);

  // Fetch payment history when tab or filters change
  useEffect(() => {
    if (activeTab === "viewHistory" || activeTab === "toPayment") {
      fetchPaymentHistory();
    }
  }, [activeTab, filters.year, filters.month]);

  const fetchPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.post(
        'http://localhost:8081/api/manager/get-Farmer-Payment-History',
        { year: filters.year, month: filters.month },
        { withCredentials: true }
      );
      
      if (response.data.Status === 'Success') {
        setPaymentHistory(response.data.paymentHistory);
      } else {
        console.error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

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
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // User suggestion functions (unchanged)
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

  // Calculation effects (unchanged)
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

  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];

  return (
    <div className="cfa-content">
      <div className="header-section">
        <h2>Payment Management</h2>
        <p className="current-date">{currentDate}</p>
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
              <button onClick={() => navigateMonth('prev')}>&lt; Previous</button>
              <h3>{monthNames[currentMonth]} {currentYear}</h3>
              <button onClick={() => navigateMonth('next')}>Next &gt;</button>
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
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
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
                placeholder="Calculated final payment"
                readOnly
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {/* View Payment History Tab */}
        {activeTab === "viewHistory" && (
          <div className="payment-history">
            <div className="filter-controls">
              <div className="filter-group">
                <label>Search User ID:</label>
                <input
                  type="text"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  placeholder="Enter user ID"
                />
              </div>
              
              <div className="filter-group">
                <label>Year:</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                >
                  {Array.from({length: 5}, (_, i) => currentYear - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Month:</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
                type="button" 
                onClick={resetFilters}
                className="reset-filters"
              >
                Reset Filters
              </button>

            <div className="results-count">
              Showing {paymentsHistory.length} records
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
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payment history found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPayment;