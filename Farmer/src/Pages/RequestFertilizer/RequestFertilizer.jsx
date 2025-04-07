import React, { useState, useEffect } from "react";
import axios from "axios";
import "./requestfertilizer.css";

const RequestFertilizer = () => {
  const [userId, setUserId] = useState("");
  const [paymentOption, setPaymentOption] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fertilizerPrices, setFertilizerPrices] = useState([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  const [items, setItems] = useState([
    {
      fertilizer_veriance_id: "",
      fertilizerType: "",
      packetType: "",
      amount: "",
      price: 0,
      totalPrice: 0
    }
  ]);

  // Fetch fertilizer prices from backend
  useEffect(() => {
    const fetchFertilizerPrices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/farmer/fertilizer-prices",
          { withCredentials: true }
        );
        setFertilizerPrices(response.data);
      } catch (error) {
        console.error("Error fetching fertilizer prices:", error);
        setMessage("Failed to load fertilizer options. Please try again later.");
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchFertilizerPrices();
  }, []);

  // Group prices by fertilizer type for dropdown
  const fertilizerTypes = [...new Set(fertilizerPrices.map(item => item.fertilizerType))];

  // Get packet types for selected fertilizer type
  const getPacketTypes = (fertilizerType) => {
    return fertilizerPrices
      .filter(item => item.fertilizerType === fertilizerType)
      .map(item => ({
        packetType: item.packetType,
        fertilizer_veriance_id: item.fertilizer_veriance_id,
        price: item.price
      }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
  
    // When fertilizer type changes, reset packet type, variance ID, price, and total price
    if (field === 'fertilizerType') {
      updatedItems[index].packetType = "";
      updatedItems[index].fertilizer_veriance_id = "";
      updatedItems[index].price = 0;
      updatedItems[index].totalPrice = 0;
    }
  
    // When packet type changes, set the price automatically
    if (field === 'packetType') {
      const selectedPacket = fertilizerPrices.find(
        (item) =>
          item.fertilizerType === updatedItems[index].fertilizerType &&
          item.packetType === value
      );
      if (selectedPacket) {
        updatedItems[index].price = selectedPacket.price;
        updatedItems[index].fertilizer_veriance_id = selectedPacket.fertilizer_veriance_id;
      }
    }
  
    // When amount changes, update total price
    if (field === 'amount') {
      const amount = parseFloat(value) || 0;
      const price = parseFloat(updatedItems[index].price) || 0;
      updatedItems[index].totalPrice = amount * price;
    }
  
    setItems(updatedItems);
  };
  
  const addNewItem = () => {
    // Check if all fields in current items are filled
    const incompleteItem = items.find(item => 
      !item.fertilizerType || !item.packetType || !item.amount
    );
    
    if (incompleteItem) {
      setMessage("Please complete current item before adding a new one.");
      return;
    }

    // Check for duplicate items
    const newItemType = items[items.length - 1].fertilizerType;
    const newItemPacket = items[items.length - 1].packetType;
    const duplicate = items.some((item, idx) => 
      idx !== items.length - 1 && 
      item.fertilizerType === newItemType && 
      item.packetType === newItemPacket
    );

    if (duplicate) {
      setMessage("This fertilizer type and packet combination already exists in your request.");
      return;
    }

    setItems([
      ...items,
      {
        fertilizer_veriance_id: "",
        fertilizerType: "",
        packetType: "",
        amount: "",
        price: 0,
        totalPrice: 0
      }
    ]);
    setMessage("");
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
      if (!item.fertilizerType || !item.packetType || !item.amount || item.amount <= 0) {
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
        fertilizer_veriance_id: item.fertilizer_veriance_id,
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
        fertilizer_veriance_id: "",
        fertilizerType: "",
        packetType: "",
        amount: "",
        price: 0,
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

  if (isLoadingPrices) {
    return (
      <div className="request-fertilizer-container">
        <div className="loading-message">Loading fertilizer options...</div>
      </div>
    );
  }

  return (
    <div className="request-fertilizer-container">
      <div className="page-header">
        <h2>Request Fertilizer</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-section full-width">
          <div className="form-row">
            <div className="form-group">
              <label>User ID:</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder="Enter User ID"
              />
            </div>

            <div className="form-group">
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
          </div>
        </div>

        <div className="items-container full-width">
          <h3>Fertilizer Items</h3>
          <div className="items-table">
            <div className="table-header">
              <div className="header-cell">Fertilizer Type</div>
              <div className="header-cell">Packet Weight</div>
              <div className="header-cell">Unit Price (LKR)</div>
              <div className="header-cell">Total Packets</div>
              <div className="header-cell">Total Amount (LKR)</div>
              <div className="header-cell">Actions</div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">
                  <select
                    value={item.fertilizerType}
                    onChange={(e) => handleItemChange(index, 'fertilizerType', e.target.value)}
                    required
                  >
                    <option value="">Select Type</option>
                    {fertilizerTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="table-cell">
                  <select
                    value={item.packetType}
                    onChange={(e) => handleItemChange(index, 'packetType', e.target.value)}
                    required
                    disabled={!item.fertilizerType}
                  >
                    <option value="">Select Weight</option>
                    {item.fertilizerType && getPacketTypes(item.fertilizerType).map(packet => (
                      <option 
                        key={packet.fertilizer_veriance_id} 
                        value={packet.fertilizer_veriance_id}
                      >
                        {packet.packetType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="table-cell price-cell">
                  {item.price.toLocaleString()}
                </div>

                <div className="table-cell">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    required
                    min="1"
                    placeholder="Enter packets"
                    disabled={!item.packetType}
                  />
                </div>

                <div className="table-cell price-cell">
                  {item.totalPrice.toLocaleString()}
                </div>

                <div className="table-cell action-cell">
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
              </div>
            ))}
          </div>

          <button 
            type="button" 
            className="add-item-btn"
            onClick={addNewItem}
          >
            + Add Another Fertilizer Item
          </button>
        </div>

        <div className="total-section full-width">
          <div className="total-label">Final Total Amount:</div>
          <div className="total-amount">{calculateTotal().toLocaleString()} LKR</div>
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