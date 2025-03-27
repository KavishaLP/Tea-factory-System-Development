/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./addnewpayment.css";

function AddPayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [paymentsHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true); 
  
  const [query, setQuery] = useState("");  // Stores input value
  const [users, setUsers] = useState([]); // Stores user suggestions
  const [selectedUser, setSelectedUser] = useState(null); // Selected user
  const [noResults, setNoResults] = useState(false); // No match flag
  
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

useEffect(() => {
  if (query.length > 0) {
      fetchUsers(query);
  } else {
      setUsers([]);
      setNoResults(false);
  }
}, [query]);

const fetchUsers = async (searchQuery) => {
  try {
      const response = await fetch(`/api/users?search=${searchQuery}`); // Adjust backend API
      const data = await response.json();

      if (data.length === 0) {
          setNoResults(true);
      } else {
          setNoResults(false);
      }

      setUsers(data);
  } catch (error) {
      console.error("Error fetching users:", error);
  }
};

const handleSelectUser = (user) => {
  setQuery(user.name); // Update input with selected name
  setSelectedUser(user); // Store selected user
  setUsers([]); // Clear suggestions
  setNoResults(false);
};

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

  // Function to fetch payment history
  useEffect(() => {
    // Check if activeTab is "viewHistory"
    if (activeTab === "viewHistory") {
      const fetchPaymentHistory = async () => {
        try {
          // Start loading
          setHistoryLoading(true);
          
          const response = await axios.post('http://localhost:8081/api/manager/get-Farmer-Payment-History', {}, { withCredentials: true });
          console.log(response.data)
          if (response.data.Status === 'Success') {
            setPaymentHistory(response.data.paymentHistory);
          } else {
            console.error('Failed to fetch payment history');
          }
        } catch (error) {
          console.error('Error fetching payment history:', error);
        } finally {
          // Stop loading
          setHistoryLoading(false);
        }
      };
  
      fetchPaymentHistory();
    }
  }, [activeTab]); // Depend on activeTab state change

{/*-------------------------------------------------------------------------------------------*/}

// Handle changes in form fields
const handleChange = (e) => {
  const { name, value } = e.target;

  // Regular expression to allow only positive numbers (including decimals)
  const positiveNumberPattern = /^\d*\.?\d*$/;

  if (name !== "userId" && value !== "" && !positiveNumberPattern.test(value)) {
    setError("Please enter a valid positive number");
    return;
  } else {
    setError(""); // Clear error if input is valid
  }

  setFormData((prevData) => {
    const updatedData = { ...prevData, [name]: value };

    // Convert salary, additionalPayments, and deductions to numbers
    const salary = parseFloat(updatedData.salaryAmount) || 0;
    const additional = parseFloat(updatedData.additionalPayments) || 0;
    const deductions = parseFloat(updatedData.deductions) || 0;

    // Calculate final payment
    updatedData.finalPayment = (salary + additional - deductions).toFixed(2);

    return updatedData;
  });
};


{/*-------------------------------------------------------------------------------------------*/}
// Handle form submission
const handleSubmit = async (e) => {
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

  try {
    // Sending data to the backend (similar to the login request)
    const response = await axios.post(
      'http://localhost:8081/api/manager/add-Farmer-Payment', // Your backend API endpoint
      formData,
      { withCredentials: true }
    );

    if (response.data && response.data.Status === "Success") {
      console.log("Payment Details Submitted Successfully:", response.data);
      alert("Payment added successfully!");

      // Optionally reset form after submission
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
    } else {
      setError(response.data.Error || 'Failed to add payment. Please try again.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Server Error:', error.response.data);
      setError(error.response.data.message || 'Server error. Please try again.');
    } else if (error.inner) {
      // Handling validation errors
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setError(Object.values(validationErrors).join(', ')); // Show validation errors
    } else {
      console.error('Payment submission error:', error);
      setError('An error occurred. Please try again.');
    }
  } finally {
    setIsLoading(false); // Ensure loading state is cleared
  }
};

  return (
    <div className="cfa-content">
      <h2>Payment Management</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "toPayment" ? "active" : ""}`}
            onClick={() => setActiveTab("toPayment")}
          >
            To Payments
          </button>
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

        {/* Farmer Payment Logs */}
        {activeTab === "toPayment" && (
          <div className="payment-history">
            <button>To Load Logs Click Here</button>
            {historyLoading ? (
              <p>Loading...</p>
            ) : paymentsHistory.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Final Tea Kilos</th>
                    <th>Payment Per Kilo</th>
                    <th>Final Amount</th>
                    <th>Advances</th>
                    <th>Final Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsHistory.map((payment, index) => (
                    <tr key={index}>
                      <td>{payment.userId}</td>
                      <td>{payment.finalTeaKilos}</td>
                      <td>{payment.paymentPerKilo}</td>
                      <td>{payment.finalAmount}</td>
                      <td>{payment.advances}</td>
                      <td>{payment.finalPayment}</td>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payment history found.</p>
            )}

          </div>
        )}

        {/* Add New Payment Form */}
        {activeTab === "addPayment" && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
            <label>User ID:</label>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by user name..."
            />

            {users.length > 0 && (
                <ul className="suggestions">
                    {users.map((user) => (
                        <li key={user.id} onClick={() => handleSelectUser(user)}>
                            {user.name} ({user.id})
                        </li>
                    ))}
                </ul>
            )}

            {noResults && <p style={{ color: "red" }}>No matching users found.</p>}

            {selectedUser && (
                <div>
                    <p>Selected User: {selectedUser.name} (ID: {selectedUser.id})</p>
                </div>
            )}
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

        {/* View Payment History Tab */}
        {activeTab === "viewHistory" && (
          <div className="payment-history">
            <h3>Payment History</h3>
            {historyLoading ? (
              <p>Loading...</p>
            ) : paymentsHistory.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Final Tea Kilos</th>
                    <th>Payment Per Kilo</th>
                    <th>Final Amount</th>
                    <th>Advances</th>
                    <th>Final Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsHistory.map((payment, index) => (
                    <tr key={index}>
                      <td>{payment.userId}</td>
                      <td>{payment.finalTeaKilos}</td>
                      <td>{payment.paymentPerKilo}</td>
                      <td>{payment.finalAmount}</td>
                      <td>{payment.advances}</td>
                      <td>{payment.finalPayment}</td>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payment history found.</p>
            )}

          </div>
        )}


      </div>
    </div>
  );
}

export default AddPayment;
