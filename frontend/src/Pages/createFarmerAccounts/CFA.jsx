/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import "./CFA.css";

const CreateFarmerAccount = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Automatically generate userName when userId changes
    if (name === "userId") {
      setFormData((prevData) => ({
        ...prevData,
        userName: `fer${value}`,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.reenterPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.userId || !formData.firstName || !formData.lastName || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Farmer Details Submitted:", formData);
      setIsLoading(false);
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
    }, 2000);
  };

  return (
    <div className="cfa-content">
      <h2>Create Farmer Account</h2>
      <div className="cfa-grid">
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
      </div>
    </div>
  );
};

export default CreateFarmerAccount;