/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import "./CFA.css";

const CreateFarmerAccount = () => {
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    farmerName: "",
    registrationNumber: "",
    contact: "",
    mobile: "",
    password: "",
    reenterPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        firstName: "",
        lastName: "",
        farmerName: "",
        registrationNumber: "",
        contact: "",
        mobile: "",
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

            <div className="input-group">
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

            <div className="input-group">
              <label>Farmer Name</label>
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleChange}
                placeholder="Enter farmer name"
              />
            </div>

            <div className="input-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="Enter registration number"
              />
            </div>

            <div className="input-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="Enter contact number"
              />
            </div>

            <div className="input-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
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