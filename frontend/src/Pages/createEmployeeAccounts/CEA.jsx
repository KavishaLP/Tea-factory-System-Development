/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import axios from 'axios';

import "./CEA.css";

const CreateEmployeeAccount = () => {
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    mobile1: "",
    mobile2: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Automatically generate userName when userId changes
  };

  // Inside your handleSubmit function:
  const handleSubmit = (e) => {
    console.log(formData)
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
  
    // Send data to backend API
    axios
      .post('http://localhost:8081/api/manager/add-Employee', formData)
      .then((response) => {
        console.log('Farmer account created:', response.data);
        alert("Account created successfully!");
        setFormData({
          userId: "",
          userName: "",
          firstName: "",
          lastName: "",
          mobile1: "",
          mobile2: "",
          password: "",
          reenterPassword: "",
        });
      })
      .catch((error) => {
        console.error('Error creating farmer account:', error);
        setError(error.response?.data?.message || 'An error occurred');
      })
      .finally(() => setIsLoading(false));
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
                required
                placeholder="Enter mobile number 2"
              />
            </div>
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

export default CreateEmployeeAccount;