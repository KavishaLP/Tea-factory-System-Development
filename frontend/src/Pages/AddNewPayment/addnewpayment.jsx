import React from 'react';
import './addnewpayment.css';

function AddPayment() {
  return (
    <div className="add-payment-container">
      <div className="page-header">
        <h1>Add New Payment</h1>
      </div>
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
    </div>
  );
}

export default AddPayment;