/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import "./addnewpayment.css";

function AddPayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [formData, setFormData] = useState({
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Automatically calculate final amount when additional or direct payments change
    if (
      name === "additionalPayments" ||
      name === "directPayments" ||
      name === "paymentForFinalTeaKilos"
    ) {
      calculateFinalAmount(updatedFormData);
    }
  };

  // Calculate 'Payment For Final Tea Kilos' when Enter is pressed in the input field
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const { paymentPerKilo, finalTeaKilos } = formData;
      if (paymentPerKilo && finalTeaKilos) {
        const paymentForFinalTeaKilos =
          parseFloat(paymentPerKilo) * parseFloat(finalTeaKilos);
        setFormData((prevData) => ({
          ...prevData,
          paymentForFinalTeaKilos: paymentForFinalTeaKilos,
        }));
      }
    }
  };

  // Calculate 'Final Amount' based on input fields
  const calculateFinalAmount = (updatedFormData) => {
    const {
      paymentForFinalTeaKilos,
      additionalPayments,
      directPayments,
    } = updatedFormData;

    const totalAmount =
      (parseFloat(paymentForFinalTeaKilos) || 0) +
      (parseFloat(additionalPayments) || 0) +
      (parseFloat(directPayments) || 0);

    setFormData((prevData) => ({
      ...prevData,
      finalAmount: totalAmount.toFixed(2), // Fixed two decimal places
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.finalTeaKilos || !formData.paymentPerKilo) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Payment Details Submitted:", formData);
      setIsLoading(false);
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
    }, 2000);
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
            Add New Payment
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
              <label>Final Tea Kilos</label>
              <input
                type="text"
                name="finalTeaKilos"
                value={formData.finalTeaKilos}
                onChange={handleChange}
                required
                placeholder="Enter final tea kilos"
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
                onKeyDown={handleKeyPress} // Trigger calculation on Enter press
                placeholder="Payment for final tea kilos"
                readOnly
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
                placeholder="Final amount"
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
              <label>Final Payment</label>
              <input
                type="text"
                name="finalPayment"
                value={formData.finalPayment}
                onChange={handleChange}
                placeholder="Enter final payment"
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
          <div className="payments-history">
            <h2>Payments History</h2>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>To Confirm</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td>Test</td>
                    <td>Test</td>
                    <td>Test</td>
                    <td>Test</td>
                    <td>
                      <button className="confirm-button">To Confirm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPayment;
