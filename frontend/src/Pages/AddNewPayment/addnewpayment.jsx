/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import "./addnewpayment.css";

function AddPayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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


{/*-------------------------------------------------------------------------------------------*/}
  // Automatically calculate the payment when paymentPerKilo or finalTeaKilos change
  useEffect(() => {
    const { paymentPerKilo, finalTeaKilos } = formData;

    // Only calculate if both values are not empty
    if (paymentPerKilo && finalTeaKilos) {
      const paymentForFinalTeaKilos =
        parseFloat(paymentPerKilo) * parseFloat(finalTeaKilos);
      setFormData((prevData) => ({
        ...prevData,
        paymentForFinalTeaKilos: paymentForFinalTeaKilos,
      }));
    }
  }, [formData.paymentPerKilo, formData.finalTeaKilos]);

  // Automatically calculate finalAmount when relevant fields change
  useEffect(() => {
    const { paymentForFinalTeaKilos, additionalPayments, transport, directPayments } = formData;

    // Only calculate if paymentForFinalTeaKilos and all other fields are available
    if (paymentForFinalTeaKilos || additionalPayments || transport || directPayments) {
      const finalAmount =
        (parseFloat(paymentForFinalTeaKilos) || 0) +
        (parseFloat(additionalPayments) || 0) +
        (parseFloat(transport) || 0) +
        (parseFloat(directPayments) || 0);

      setFormData((prevData) => ({
        ...prevData,
        finalAmount: finalAmount.toFixed(2), // Round to two decimal places
      }));
    }
  }, [formData.paymentForFinalTeaKilos, formData.additionalPayments, formData.transport, formData.directPayments]);

  // Automatically calculate finalPayment after deductions
  useEffect(() => {
    const { finalAmount, advances, teaPackets, fertilizer } = formData;

    // Calculate deductions
    const totalDeductions =
      (parseFloat(advances) || 0) +
      (parseFloat(teaPackets) || 0) +
      (parseFloat(fertilizer) || 0);

    // Deduct from finalAmount
    const finalPayment = (parseFloat(finalAmount) || 0) - totalDeductions;

    setFormData((prevData) => ({
      ...prevData,
      finalPayment: finalPayment.toFixed(2), // Round to two decimal places
    }));
  }, [formData.finalAmount, formData.advances, formData.teaPackets, formData.fertilizer]);  

{/*-------------------------------------------------------------------------------------------*/}
  // Handle changes in form fields
// Handle changes in form fields
const handleChange = (e) => {
  const { name, value } = e.target;

  // Validate input only if it's a numeric field
  const positiveNumberPattern = /^\d+(\.\d+)?$/;
  if (
    name !== "userId" &&
    (value !== "" && !positiveNumberPattern.test(value))
  ) {
    setError("Please enter a valid positive number");
  } else {
    setError(""); // Clear error if input is valid
  }

  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};



  // Handle form submission
// Handle form submission
const handleSubmit = (e) => {
  e.preventDefault();

  // Validation for positive numbers
  const positiveNumberPattern = /^\d+(\.\d+)?$/;

  // Check if all required fields are filled with positive numbers
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

  // Continue if validation passes
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

{/*-------------------------------------------------------------------------------------------*/}
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
                placeholder="Payment for final tea kilos"
                readOnly
              />
            </div>

{/*----------------------------------------------------*/}
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

{/*----------------------------------------------------*/}

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
{/*----------------------------------------------------*/}

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
