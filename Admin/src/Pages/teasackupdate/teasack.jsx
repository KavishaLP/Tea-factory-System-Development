import React, { useState } from 'react';
import axios from 'axios'; // Import axios for API calls
import './teasack.css'; // Updated CSS file
import Navbar from '../../Component/Navbar/Navbar2';
import Sidebar from '../../Component/sidebar/sidebar2';

function TeaSackUpdate() {
  const [userId, setUserId] = useState('');
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

  // Function to calculate total fertilizer amount
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
  
    // Validate required fields
    if (!userId || !date || !teaSackWeight) {
      setError("Please fill in all required fields.");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      // Prepare data to send to the backend
      const formData = {
        userId,
        date,
        teaSackWeight,
        deductions,
        totalTeaSackAmount
      };
  
      // Log the form data for debugging
      console.log("Form Data:", formData);
  
      // Send data to the backend
      const response = await axios.post(
        "http://localhost:8081/api/admin/add-tea-sack", // Backend API endpoint
        formData,
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        alert("Tea sack data submitted successfully!");
        // Reset form fields only after successful submission
        setUserId("");
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
            <label htmlFor="searchUserId">Search User Id Here</label>
            <input 
              type="text" 
              id="searchUserId" 
              placeholder="Search User Id Here" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <form className="tea-sack-update-form" onSubmit={handleSubmit}>
            <label>User Id</label>
            <input 
              type="text" 
              placeholder="User Id" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label>Tea Sack Weight</label>
            <input 
              type="text" 
              placeholder="Tea Sack Weight" 
              value={teaSackWeight} 
              onChange={handleTeaSackWeightChange}
              required
            />

            <div className="tea-sack-update-deduction-section">
              <label>Deduction</label>
              <div className="tea-sack-update-deduction-fields">
                <div>
                  <span>For water :</span>
                  <input type="text" name="water" value={deductions.water} onChange={handleDeductionChange} />
                </div>
                <div>
                  <span>For damage tea Leaves :</span>
                  <input type="text" name="damageTea" value={deductions.damageTea} onChange={handleDeductionChange} />
                </div>
                <div>
                  <span>For sack weight :</span>
                  <input type="text" name="sackWeight" value={deductions.sackWeight} onChange={handleDeductionChange} />
                </div>
                <div>
                  <span>For sharped tea :</span>
                  <input type="text" name="sharpedTea" value={deductions.sharpedTea} onChange={handleDeductionChange} />
                </div>
                <div>
                  <span>Other :</span>
                  <input type="text" name="other" value={deductions.other} onChange={handleDeductionChange} />
                </div>
              </div>
            </div>

            <div className="tea-sack-update-teasack-amount">
              <label>Total Tea Amount:</label>
              <input type="text" value={totalTeaSackAmount} readOnly />
            </div>

            {error && <p className="tea-sack-update-error">{error}</p>}

            <button type="submit" className="tea-sack-update-submit-button" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeaSackUpdate;