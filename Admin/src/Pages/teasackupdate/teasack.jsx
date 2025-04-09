import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './teasack.css';
import Navbar from '../../Component/Navbar/Navbar2';
import Sidebar from '../../Component/sidebar/sidebar2';

function TeaSackUpdate() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [date, setDate] = useState('');
  const [teaSackWeight, setTeaSackWeight] = useState('');
  const [deductions, setDeductions] = useState({
    water: '',
    damageTea: '',
    sackWeight: '',
    sharpedTea: '',
    other: ''
  });
  const [totalTeaSackAmount, setTotalTeaSackAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch users based on search term
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/admin/search?term=${searchTerm}`,
        { withCredentials: true }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle user selection from search results
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.userId} - ${user.name}`);
    setSearchResults([]);
  };

  // Handle deduction input changes
  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setDeductions((prevDeductions) => ({
      ...prevDeductions,
      [name]: value
    }));
    calculateTotalTeaSackAmount(teaSackWeight, { ...deductions, [name]: value });
  };

  // Handle Tea Sack Weight change
  const handleTeaSackWeightChange = (e) => {
    const value = e.target.value;
    setTeaSackWeight(value);
    calculateTotalTeaSackAmount(value, deductions);
  };

  // Calculate total tea sack amount
  const calculateTotalTeaSackAmount = (weight, deductions) => {
    const numericWeight = parseFloat(weight) || 0;
    const totalDeductions = 
      (parseFloat(deductions.water) || 0) +
      (parseFloat(deductions.damageTea) || 0) +
      (parseFloat(deductions.sackWeight) || 0) +
      (parseFloat(deductions.sharpedTea) || 0) +
      (parseFloat(deductions.other) || 0);

    const finalAmount = numericWeight - totalDeductions;
    setTotalTeaSackAmount(finalAmount > 0 ? finalAmount.toFixed(2) : '0');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedUser || !date || !teaSackWeight) {
      setError("Please select a user and fill in all required fields.");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const formData = {
        userId: selectedUser.userId,
        date,
        teaSackWeight,
        deductions,
        totalTeaSackAmount
      };
  
      const response = await axios.post(
        "http://localhost:8081/api/admin/add-tea-sack",
        formData,
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        alert("Tea sack data submitted successfully!");
        // Reset form
        setSelectedUser(null);
        setSearchTerm("");
        setDate("");
        setTeaSackWeight("");
        setDeductions({
          water: '',
          damageTea: '',
          sackWeight: '',
          sharpedTea: '',
          other: ''
        });
        setTotalTeaSackAmount("");
      } else {
        setError(response.data.message || "Failed to submit tea sack data.");
      }
    } catch (error) {
      console.error("Error submitting tea sack data:", error);
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tea-sack-update-container">
      <Navbar />
      <Sidebar />
      <div className="tea-sack-update-content-wrapper">
        <div className="tea-sack-update-content">
          <div className="tea-sack-update-page-header">
            <h1>Tea Sack Update</h1>
          </div>

          <div className="tea-sack-update-search-bar">
            <label htmlFor="searchUserId">Search User by ID or Name</label>
            <input 
              type="text" 
              id="searchUserId" 
              placeholder="Enter user ID or name" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && <div className="search-loading">Searching...</div>}
            
            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map(user => (
                  <div 
                    key={user.userId} 
                    className="search-result-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    <span>{user.userId}</span>
                    <span>{user.name}</span>
                    <span>{user.nic}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="selected-user-info">
              <h3>Selected User:</h3>
              <p>ID: {selectedUser.userId}</p>
              <p>Name: {selectedUser.name}</p>
              <p>NIC: {selectedUser.nic}</p>
            </div>
          )}

          <form className="tea-sack-update-form" onSubmit={handleSubmit}>
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label>Tea Sack Weight (kg)</label>
            <input 
              type="number" 
              placeholder="Enter weight in kg" 
              value={teaSackWeight} 
              onChange={handleTeaSackWeightChange}
              required
              step="0.01"
              min="0"
            />

            <div className="tea-sack-update-deduction-section">
              <label>Deductions (kg)</label>
              <div className="tea-sack-update-deduction-fields">
                <div>
                  <span>For water:</span>
                  <input 
                    type="number" 
                    name="water" 
                    value={deductions.water} 
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <span>For damage tea leaves:</span>
                  <input 
                    type="number" 
                    name="damageTea" 
                    value={deductions.damageTea} 
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <span>For sack weight:</span>
                  <input 
                    type="number" 
                    name="sackWeight" 
                    value={deductions.sackWeight} 
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <span>For sharped tea:</span>
                  <input 
                    type="number" 
                    name="sharpedTea" 
                    value={deductions.sharpedTea} 
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <span>Other:</span>
                  <input 
                    type="number" 
                    name="other" 
                    value={deductions.other} 
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="tea-sack-update-teasack-amount">
              <label>Net Tea Amount (kg):</label>
              <input 
                type="number" 
                value={totalTeaSackAmount} 
                readOnly 
                step="0.01"
              />
            </div>

            {error && <p className="tea-sack-update-error">{error}</p>}

            <button 
              type="submit" 
              className="tea-sack-update-submit-button" 
              disabled={isLoading || !selectedUser}
            >
              {isLoading ? "Submitting..." : "Submit Tea Sack Data"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeaSackUpdate;