import React from "react";
import "./requestfertilizer.css";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const RequestFertilizer = () => {
  return (
    <div className="container">
      

      <main className="content">
        <div className="form-container">
          <h2>Request Fertilizer</h2>
          <form>
            <label>User Id</label>
            <input type="text" placeholder="Enter User ID" />

            <label>Fertilizer Type</label>
<select>
    <option value="">Select Type</option>
    <option value="Urea">Urea</option>
    <option value="Compost">Compost</option>
    <option value="NPK">NPK</option>
    <option value="DAP">DAP</option>
</select>

            <label>Fertilizer amount (Kilos)</label>
            <input type="number" placeholder="Enter amount" />

            <button type="submit">Submit Request</button>
          </form>
        </div>
      </main>

      
    </div>
  );
};

export default RequestFertilizer;
