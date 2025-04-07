import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./CEA.css";

const CreateEmployeeAccount = () => {
  const [activeTab, setActiveTab] = useState("createAccount"); // State for active tab
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    mobile1: "",
    mobile2: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employeeAccounts, setEmployeeAccounts] = useState([]); // State for employee accounts
  const [historyLoading, setHistoryLoading] = useState(false); // Loading state for employee accounts

  // Fetch employee accounts when the "View Employee Accounts" tab is active
  useEffect(() => {
    if (activeTab === "viewAccounts") {
      const fetchEmployeeAccounts = async () => {
        setHistoryLoading(true);
        setError(""); // Clear any previous errors
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.userId || !formData.firstName || !formData.lastName || !formData.mobile1) {
      setError("Please fill in all required fields");
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
                  placeholder="Enter mobile number 1"
                />
              </div>
              <div className="input-field">
                <label>Mobile Number 2 (Optional)</label>
                <input
                  type="tel"
                  name="mobile2"
                  value={formData.mobile2}
                  onChange={handleChange}
                  placeholder="Enter mobile number 2"
                />
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* View Employee Accounts Table */}
        {activeTab === "viewAccounts" && (
          <div className="employee-accounts-table">
            <h3>Employee Accounts</h3>
            {historyLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">{error}</p>
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