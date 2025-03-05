import React, { useState } from "react";
import axios from 'axios';
import "./Employeepayment.css";

function Employeepayment() {
  const [activeTab, setActiveTab] = useState("addPayment");
  const [formData, setFormData] = useState({
    userId: "",
    salaryAmount: "",
    additionalPayments: "",
    deductions: "",
    finalPayment: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);  

  // Function to fetch payment history
  useEffect(() => {
    // Check if activeTab is "viewHistory"
    if (activeTab === "viewHistory") {
      const fetchPaymentHistory = async () => {
        try {
          // Start loading
          setHistoryLoading(true);
          
          const response = await axios.post('http://localhost:8081/api/manager/get-Employee-Payment-History', {}, { withCredentials: true });
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

  // Handle change for input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow empty input or valid numeric values (including decimals)
    if (name !== "userId" && value !== "" && !/^\d*\.?\d*$/.test(value)) {
      setError("Please enter a valid positive number");
      return;
    }

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Calculate final payment when salary, additional payments, or deductions change
      const salary = parseFloat(updatedData.salaryAmount) || 0;
      const additional = parseFloat(updatedData.additionalPayments) || 0;
      const deductions = parseFloat(updatedData.deductions) || 0;

      updatedData.finalPayment = (salary + additional - deductions).toFixed(2);

      return updatedData;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!formData.userId || !formData.salaryAmount) {
      setError("User ID and Salary Amount are required");
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:8081/api/manager/add-Employee-Payment", // Adjust API endpoint as needed
        formData,
        { withCredentials: true }
      );
  
      if (response.data && response.data.status === "Success") {
        alert("Payment added successfully!");
        setFormData({
          userId: "",
          salaryAmount: "",
          additionalPayments: "",
          deductions: "",
          finalPayment: "",
        });
      } else {
        setError(response.data.error || "Failed to add payment.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
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
            Add New Employee Payment
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
              <label>Salary Amount</label>
              <input
                type="text"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleChange}
                required
                placeholder="Enter salary amount"
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
              <label>Deductions</label>
              <input
                type="text"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                placeholder="Enter deductions"
              />
            </div>

            <div className="input-group">
              <label>Final Payment</label>
              <input
                type="text"
                name="finalPayment"
                value={formData.finalPayment}
                readOnly
                placeholder="Calculated final payment"
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

export default Employeepayment;
