import React, { useState } from "react";
import axios from "axios";
import "./requestfertilizer.css";

const RequestFertilizer = () => {
  const [userId, setUserId] = useState("");
  const [paymentOption, setPaymentOption] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [items, setItems] = useState([
    {
      fertilizerType: "",
      fertilizerPacketType: "",
      amount: "",
      totalPrice: 0
    }
  ]);

  // Price mapping for different fertilizer types and packet sizes
  const priceMap = {
    Urea: { 5: 500, 10: 950, 50: 4500 },
    Compost: { 5: 400, 10: 750, 50: 3500 },
    NPK: { 5: 600, 10: 1150, 50: 5500 },
    DAP: { 5: 700, 10: 1350, 50: 6500 }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    // Calculate total price when fertilizer type, packet type, or amount changes
    if (field === 'fertilizerType' || field === 'fertilizerPacketType' || field === 'amount') {
      const { fertilizerType, fertilizerPacketType, amount } = updatedItems[index];
      if (fertilizerType && fertilizerPacketType && amount) {
        const unitPrice = priceMap[fertilizerType]?.[fertilizerPacketType] || 0;
        updatedItems[index].totalPrice = unitPrice * parseInt(amount, 10);
      } else {
        updatedItems[index].totalPrice = 0;
      }
    }
    
    setItems(updatedItems);
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        fertilizerType: "",
        fertilizerPacketType: "",
        amount: "",
        totalPrice: 0
      }
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!userId || !paymentOption) {
      setMessage("Please fill all required fields.");
      return;
    }

    // Validate each item
    for (const item of items) {
      if (!item.fertilizerType || !item.fertilizerPacketType || !item.amount || item.amount <= 0) {
        setMessage("Please fill all fields for all fertilizer items and enter valid amounts.");
        return;
      }
    }

    setIsLoading(true);
    setMessage("");

    // Prepare data to send to the backend
    const requestData = {
      userId,
      paymentOption,
      items: items.map(item => ({
        fertilizerType: item.fertilizerType,
        fertilizerPacketType: item.fertilizerPacketType,
        amount: item.amount,
        totalPrice: item.totalPrice
      })),
      totalAmount: calculateTotal()
    };

    try {
      // Send data to the backend
      const response = await axios.post(
        "http://localhost:8081/api/farmer/fertilizer-request",
        requestData,
        { withCredentials: true }
      );

      // Handle success
      setMessage("Fertilizer request submitted successfully!");
      console.log("Response from backend:", response.data);

      // Clear form fields
      setUserId("");
      setPaymentOption("");
      setItems([{
        fertilizerType: "",
        fertilizerPacketType: "",
        amount: "",
        totalPrice: 0
      }]);
    } catch (error) {
      // Handle error
      console.error("Error submitting fertilizer request:", error);
      setMessage(error.response?.data?.message || "An error occurred while submitting the request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="request-fertilizer-container">
      <div className="page-header">
        <h2>Request Fertilizer</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="Enter User ID"
          />
        </div>

        <div className="form-section">
          <label>Payment Option:</label>
          <select
            value={paymentOption}
            onChange={(e) => setPaymentOption(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="cash">Pay with Cash</option>
            <option value="deductpayment">Deduct from Monthly Payment</option>
          </select>
        </div>

        <div className="items-container">
          <h3>Fertilizer Items</h3>
          {items.map((item, index) => (
            <div key={index} className="fertilizer-item">
              <div className="item-header">
                <h4>Item #{index + 1}</h4>
                {items.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-item-btn"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-section">
                <label>Fertilizer Type:</label>
                <select
                  value={item.fertilizerType}
                  onChange={(e) => handleItemChange(index, 'fertilizerType', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Urea">Urea</option>
                  <option value="Compost">Compost</option>
                  <option value="NPK">NPK</option>
                  <option value="DAP">DAP</option>
                </select>
              </div>

              <div className="form-section">
                <label>Fertilizer Packet Weight:</label>
                <select
                  value={item.fertilizerPacketType}
                  onChange={(e) => handleItemChange(index, 'fertilizerPacketType', e.target.value)}
                  required
                >
                  <option value="">Select Weight</option>
                  <option value="5">5 Kg</option>
                  <option value="10">10 Kg</option>
                  <option value="50">50 Kg</option>
                </select>
              </div>

              <div className="form-section">
                <label>Number of Packets:</label>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  required
                  min="1"
                  placeholder="Enter number of packets"
                />
              </div>

              <div className="form-section">
                <label>Item Total Price (LKR):</label>
                <input
                  type="text"
                  value={item.totalPrice.toLocaleString()}
                  readOnly
                  className="price-display"
                />
              </div>
            </div>
          ))}

          <button 
            type="button" 
            className="add-item-btn"
            onClick={addNewItem}
          >
            + Add Another Fertilizer Item
          </button>
        </div>

        <div className="form-section total-section">
          <label>Final Total Amount (LKR):</label>
          <input
            type="text"
            value={calculateTotal().toLocaleString()}
            readOnly
            className="total-display"
          />
        </div>

        {message && <p className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</p>}

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestFertilizer;