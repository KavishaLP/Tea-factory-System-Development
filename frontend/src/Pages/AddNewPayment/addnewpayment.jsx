import React, { useState } from "react";
import "./addnewpayment.css";

function AddPayment() {
  const [activeTab, setActiveTab] = useState("addPayment");

  return (
    <div className="add-payment-container">
      <div className="page-header">
        <h1>Payment Management</h1>
      </div>

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
        <form className="payment-form">
          <label>User Id</label>
          <input type="text" placeholder="User Id" />

          <label>Final Tea Kilos</label>
          <input type="text" placeholder="Final Tea Kilos" />

          <label>Payment For 1 Kilo</label>
          <input type="text" placeholder="Payment For 1 Kilo" />

          <label>Payment For Final Tea Kilos</label>
          <input type="text" placeholder="Payment For Final Tea Kilos" />

          <label>Additional Payments</label>
          <input type="text" placeholder="Additional Payments" />

          <label>Direct Payments</label>
          <input type="text" placeholder="Direct Payments" />

          <label>Final Payment</label>
          <input type="text" placeholder="Final Payment" />

          <label>Deductions</label>
          <div className="deduction-fields">
            <input type="text" placeholder="Advances" />
            <input type="text" placeholder="Tea Packets" />
            <input type="text" placeholder="Fertilizer" />
            <input type="text" placeholder="Transport" />
          </div>

          <label>Final</label>
          <input type="text" placeholder="Final Amount" />

          <button type="submit" className="submit-button">Submit</button>
        </form>
      )}

      {/* View Payments History Table */}
      {activeTab === "viewHistory" && (
        <div className="payments-history">
          <h2>Payments History</h2>
          <table className="payments-table">
            <thead>
              <tr>
                <th>User Id</th>
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
  );
}

export default AddPayment;