import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./CEA.css";

const CreateEmployeeAccount = () => {
  const [activeTab, setActiveTab] = useState("createAccount");
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    mobile1: "",
    mobile2: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employeeAccounts, setEmployeeAccounts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileErrors, setMobileErrors] = useState({
    mobile1: "",
    mobile2: ""
  });

  // Fetch employee accounts when the "View Employee Accounts" tab is active
  useEffect(() => {
    if (activeTab === "viewAccounts") {
      const fetchEmployeeAccounts = async () => {
        setHistoryLoading(true);
        setError("");
        try {
          const response = await axios.get(
            "http://localhost:8081/api/manager/get-employee-accounts",
            { withCredentials: true }
          );
          console.log("Employee accounts response:", response.data.status);
          if (response.data.status === "success") {
            setEmployeeAccounts(response.data.data);
          } else {
            setError("Failed to fetch employee accounts. Please try again later.");
          }
        } catch (error) {
          console.error("Error fetching employee accounts:", error);
          setError("An error occurred while fetching employee accounts. Please check your connection and try again.");
        } finally {
          setHistoryLoading(false);
        }
      };

      fetchEmployeeAccounts();
    }
  }, [activeTab]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = employeeAccounts.filter(employee =>
      employee.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.mobile1.includes(searchTerm) ||
      (employee.mobile2 && employee.mobile2.includes(searchTerm))
    );
    setSearchResults(results);
  }, [searchTerm, employeeAccounts]);

  // Validate mobile number format
  const validateMobileNumber = (number, fieldName) => {
    if (!number) return fieldName === "mobile1" ? "Mobile number is required" : "";
    
    // Sri Lankan mobile number regex (accepts 0 or +94 prefix)
    const regex = /^(?:\+94|0)(7[01245678]|71|72|75|76|77|78|21|23|24|25|26|27|28|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)(\d{7})$/;
    
    if (!regex.test(number)) {
      return "Please enter a valid Sri Lankan mobile number (e.g., 0771234567 or +94771234567)";
    }
    return "";
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });
    
    // Validate mobile numbers immediately on change
    if (name === "mobile1" || name === "mobile2") {
      const errorMessage = validateMobileNumber(value, name);
      setMobileErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Run validation for all fields before submission
    const mobile1Error = validateMobileNumber(formData.mobile1, "mobile1");
    const mobile2Error = formData.mobile2 ? validateMobileNumber(formData.mobile2, "mobile2") : "";
    
    setMobileErrors({
      mobile1: mobile1Error,
      mobile2: mobile2Error
    });

    // Check for any validation errors
    const hasErrors = !formData.userId || !formData.firstName || !formData.lastName || 
                     mobile1Error || mobile2Error;

    if (hasErrors) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setError("");
    setIsLoading(true);

    // Send data to backend API
    axios
      .post('http://localhost:8081/api/manager/add-Employee', formData)
      .then((response) => {
        console.log('Employee account created:', response.data);
        alert("Account created successfully!");
        setFormData({
          userId: "",
          firstName: "",
          lastName: "",
          mobile1: "",
          mobile2: "",
        });
        setMobileErrors({
          mobile1: "",
          mobile2: ""
        });
      })
      .catch((error) => {
        console.error('Error creating Employee account:', error);
        setError(error.response?.data?.message || 'An error occurred while creating the account. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="cfa-content">
      <h2>Employee Account Management</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "createAccount" ? "active" : ""}`}
            onClick={() => setActiveTab("createAccount")}
          >
            Create Employee Account
          </button>
          <button
            className={`tab-button ${activeTab === "viewAccounts" ? "active" : ""}`}
            onClick={() => setActiveTab("viewAccounts")}
          >
            View Employee Accounts
          </button>
        </div>

        {/* Create Employee Account Form */}
        {activeTab === "createAccount" && (
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

            {/* First Name and Last Name in one row with equal sizes */}
            <div className="input-group two-column">
              <div className="input-field">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="input-field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Mobile Numbers */}
            <div className="input-group two-column">
              <div className="input-field">
                <label>Mobile Number 1</label>
                <input
                  type="tel"
                  name="mobile1"
                  value={formData.mobile1}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 0771234567 or +94771234567"
                />
                {mobileErrors.mobile1 && (
                  <span className="error-message">{mobileErrors.mobile1}</span>
                )}
              </div>
              <div className="input-field">
                <label>Mobile Number 2 (Optional)</label>
                <input
                  type="tel"
                  name="mobile2"
                  value={formData.mobile2}
                  onChange={handleChange}
                  placeholder="e.g., 0771234567 or +94771234567"
                />
                {mobileErrors.mobile2 && (
                  <span className="error-message">{mobileErrors.mobile2}</span>
                )}
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading || mobileErrors.mobile1 || mobileErrors.mobile2} 
              className={isLoading ? "loading" : ""}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* View Employee Accounts Table */}
        {activeTab === "viewAccounts" && (
          <div className="employee-accounts-table">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </span>
            </div>

            <h3>Employee Accounts</h3>
            {historyLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : isSearching ? (
              searchResults.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Mobile 1</th>
                      <th>Mobile 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((employee, index) => (
                      <tr key={index}>
                        <td>{employee.userId}</td>
                        <td>{employee.firstName}</td>
                        <td>{employee.lastName}</td>
                        <td>{employee.mobile1}</td>
                        <td>{employee.mobile2 || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No matching employees found.</p>
              )
            ) : employeeAccounts.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Mobile 1</th>
                    <th>Mobile 2</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAccounts.map((employee, index) => (
                    <tr key={index}>
                      <td>{employee.userId}</td>
                      <td>{employee.firstName}</td>
                      <td>{employee.lastName}</td>
                      <td>{employee.mobile1}</td>
                      <td>{employee.mobile2 || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No employee accounts found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEmployeeAccount;