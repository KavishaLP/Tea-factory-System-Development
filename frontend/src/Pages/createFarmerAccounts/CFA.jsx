import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./CFA.css";

const CreateFarmerAccount = () => {
  const [activeTab, setActiveTab] = useState("createAccount"); // State for active tab
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    firstName: "",
    lastName: "",
    address: "",
    mobile1: "",
    mobile2: "",
    gmail: "",
    password: "",
    reenterPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [farmerAccounts, setFarmerAccounts] = useState([]); // State for farmer accounts
  const [historyLoading, setHistoryLoading] = useState(false); // Loading state for farmer accounts

  // Fetch farmer accounts when the "View Farmer Accounts" tab is active
  useEffect(() => {
    if (activeTab === "viewAccounts") {
      const fetchFarmerAccounts = async () => {
        setHistoryLoading(true);
        setError(""); // Clear any previous errors
        try {
          const response = await axios.get(
            "http://localhost:8081/api/manager/get-farmer-accounts",
            { withCredentials: true }
          );
          if (response.data.status === "Success") {
            setFarmerAccounts(response.data.farmerAccounts);
          } else {
            setError("Failed to fetch farmer accounts. Please try again later.");
          }
        } catch (error) {
          console.error("Error fetching farmer accounts:", error);
          setError("An error occurred while fetching farmer accounts. Please check your connection and try again.");
        } finally {
          setHistoryLoading(false);
        }
      };

      fetchFarmerAccounts();
    }
  }, [activeTab]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Automatically generate userName when userId changes
    if (name === "userId") {
      setFormData((prevData) => ({
        ...prevData,
        userName: `farmer_${value}`,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.userId || !formData.firstName || !formData.lastName || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.reenterPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    // Send data to backend API
    axios
      .post('http://localhost:8081/api/manager/add-farmer', formData)
      .then((response) => {
        console.log('Farmer account created:', response.data);
        alert("Account created successfully!");
        setFormData({
          userId: "",
          userName: "",
          firstName: "",
          lastName: "",
          address: "",
          mobile1: "",
          mobile2: "",
          gmail: "",
          password: "",
          reenterPassword: "",
        });
      })
      .catch((error) => {
        console.error('Error creating farmer account:', error);
        setError(error.response?.data?.message || 'An error occurred while creating the account. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="cfa-content">
      <h2>Farmer Account Management</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "createAccount" ? "active" : ""}`}
            onClick={() => setActiveTab("createAccount")}
          >
            Create Farmer Account
          </button>
          <button
            className={`tab-button ${activeTab === "viewAccounts" ? "active" : ""}`}
            onClick={() => setActiveTab("viewAccounts")}
          >
            View Farmer Accounts
          </button>
        </div>

        {/* Create Farmer Account Form */}
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

            <div className="input-group">
              <label>User Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                readOnly
                placeholder="Auto-generated"
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

            <div className="input-group full-row">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter address"
              />
            </div>

            <div className="input-group">
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

            <div className="input-group">
              <label>Mobile Number 2 (Optional)</label>
              <input
                type="tel"
                name="mobile2"
                value={formData.mobile2}
                onChange={handleChange}
                placeholder="Enter mobile number 2"
              />
            </div>

            <div className="input-group full-row">
              <label>Gmail</label>
              <input
                type="email"
                name="gmail"
                value={formData.gmail}
                onChange={handleChange}
                required
                placeholder="Enter Gmail"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>

            <div className="input-group">
              <label>Re-enter Password</label>
              <input
                type="password"
                name="reenterPassword"
                value={formData.reenterPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* View Farmer Accounts Table */}
        {activeTab === "viewAccounts" && (
          <div className="farmer-accounts-table">
            <h3>Farmer Accounts</h3>
            {historyLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : farmerAccounts.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Address</th>
                    <th>Mobile 1</th>
                    <th>Mobile 2</th>
                    <th>Gmail</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerAccounts.map((farmer, index) => (
                    <tr key={index}>
                      <td>{farmer.userId}</td>
                      <td>{farmer.userName}</td>
                      <td>{farmer.firstName}</td>
                      <td>{farmer.lastName}</td>
                      <td>{farmer.address}</td>
                      <td>{farmer.mobile1}</td>
                      <td>{farmer.mobile2 || "-"}</td>
                      <td>{farmer.gmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No farmer accounts found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFarmerAccount;