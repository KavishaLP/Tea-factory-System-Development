import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaSeedling, FaHistory, FaTimes } from "react-icons/fa";
import axios from "axios";
import "./DashboardFarmer.css";

const DashboardFarmer = ({ userId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    teaKilos: 0,
    lastPayment: 0,
    pendingAdvances: 0,
    pendingFertilizers: 0
  });
  const [activePopup, setActivePopup] = useState(null);
  const [popupData, setPopupData] = useState([]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [currentMonth, currentYear, userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      
      // Fetch all dashboard data in parallel
      const [teaData, paymentData, advanceData, fertilizerData] = await Promise.all([
        fetchTeaKilos(userId, monthYear),
        fetchPayments(userId, monthYear),
        fetchAdvances(userId, monthYear),
        fetchFertilizers(userId, monthYear)
      ]);

      setDashboardData({
        teaKilos: teaData.total,
        lastPayment: paymentData.amount,
        pendingAdvances: advanceData.pending,
        pendingFertilizers: fertilizerData.pending
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  // API call functions
  const fetchTeaKilos = async (userId, monthYear) => {
    const response = await axios.get("http://localhost:8081/api/farmer/tea-deliveries", {
      params: { userId, monthYear }
    });
    return response.data;
  };

  const fetchPayments = async (userId, monthYear) => {
    const response = await axios.get("http://localhost:8081/api/farmer/last-payment", {
      params: { userId, monthYear }
    });
    return response.data;
  };

  const fetchAdvances = async (userId, monthYear) => {
    const response = await axios.get("http://localhost:8081/api/farmer/advances", {
      params: { userId, monthYear }
    });
    return response.data;
  };

  const fetchFertilizers = async (userId, monthYear) => {
    const response = await axios.get("http://localhost:8081/api/farmer/fertilizer-requests", {
      params: { userId, monthYear }
    });
    return response.data;
  };

  const fetchPopupDetails = async (type) => {
    try {
      setLoading(true);
      const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      let response;

      switch (type) {
        case "tea":
          response = await axios.get("http://localhost:8081/api/farmer/tea-delivery-details", {
            params: { userId, monthYear }
          });
          break;
        case "payment":
          response = await axios.get("/api/farmer/payment-details", {
            params: { userId, monthYear }
          });
          break;
        case "advances":
          response = await axios.get("/api/farmer/advance-details", {
            params: { userId, monthYear }
          });
          break;
        case "fertilizer":
          response = await axios.get("/api/farmer/fertilizer-request-details", {
            params: { userId, monthYear }
          });
          break;
        default:
          return;
      }

      setPopupData(response.data);
      setActivePopup(type);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Failed to load details. Please try again.");
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      // Don't allow navigation to future months
      const now = new Date();
      if (currentYear < now.getFullYear() || 
          (currentYear === now.getFullYear() && currentMonth < now.getMonth() + 1)) {
        if (currentMonth === 12) {
          setCurrentMonth(1);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }
      }
    }
  };

  const closePopup = () => {
    setActivePopup(null);
    setPopupData([]);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2>Welcome, {userId}</h2>
        <div className="month-navigation">
          <button onClick={() => navigateMonth("prev")}>{"<"} Previous</button>
          <h3>
            {monthNames[currentMonth - 1]} {currentYear}
          </h3>
          <button
            onClick={() => navigateMonth("next")}
            disabled={
              new Date(currentYear, currentMonth) >=
              new Date(new Date().getFullYear(), new Date().getMonth() + 1)
            }
          >
            Next {">"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <div className="dashboard-summary">
          <div className="card" onClick={() => fetchPopupDetails("tea")}>
            <FaSeedling className="card-icon" />
            <h3>Total Tea Delivered</h3>
            <p>{(dashboardData?.teaKilos ?? 0).toFixed(2)} Kg</p>
          </div>

          <div className="card" onClick={() => fetchPopupDetails("payment")}>
            <FaMoneyBillWave className="card-icon" />
            <h3>Last Payment</h3>
            <p>Rs. {(dashboardData?.lastPayment ?? 0).toFixed(2)}</p>
          </div>

          <div className="card" onClick={() => fetchPopupDetails("advances")}>
            <FaMoneyBillWave className="card-icon" />
            <h3>Pending Advances</h3>
            <p>{dashboardData.pendingAdvances}</p>
          </div>

          <div className="card" onClick={() => fetchPopupDetails("fertilizer")}>
            <FaHistory className="card-icon" />
            <h3>Fertilizer Requests</h3>
            <p>Pending: {dashboardData.pendingFertilizers}</p>
          </div>
        </div>
      )}

      {/* Popup Modals */}
      {activePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={closePopup}>
              <FaTimes />
            </button>

            <h3>
              {activePopup === "tea" && "Tea Delivery Details"}
              {activePopup === "payment" && "Payment Details"}
              {activePopup === "advances" && "Advance Details"}
              {activePopup === "fertilizer" && "Fertilizer Requests"}
            </h3>

            {loading ? (
              <div className="loading-indicator">Loading details...</div>
            ) : (
              <div className="popup-details">
                {activePopup === "tea" && (
                  <TeaDeliveryDetails data={popupData} monthYear={`${monthNames[currentMonth - 1]} ${currentYear}`} />
                )}
                {activePopup === "payment" && (
                  <PaymentDetails data={popupData} />
                )}
                {activePopup === "advances" && (
                  <AdvanceDetails data={popupData} />
                )}
                {activePopup === "fertilizer" && (
                  <FertilizerDetails data={popupData} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for Tea Delivery Details
const TeaDeliveryDetails = ({ data, monthYear }) => {
  return (
    <div>
      <h4>Tea Deliveries for {monthYear}</h4>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Gross Weight</th>
            <th>Deductions</th>
            <th>Net Weight</th>
          </tr>
        </thead>
        <tbody>
          {data.map((delivery, index) => (
            <tr key={index}>
              <td>{new Date(delivery.date).toLocaleDateString()}</td>
              <td>{delivery.tea_sack_weight} kg</td>
              <td>
                Water: {delivery.deduction_water} kg<br />
                Damage: {delivery.deduction_damage_tea} kg<br />
                Sack: {delivery.deduction_sack_weight} kg
              </td>
              <td>{delivery.final_tea_sack_weight} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-summary">
        <p>Total Net Weight: {data.reduce((sum, item) => sum + parseFloat(item.final_tea_sack_weight), 0).toFixed(2)} kg</p>
      </div>
    </div>
  );
};

// Component for Payment Details
const PaymentDetails = ({ data }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Tea Kilos</th>
            <th>Rate</th>
            <th>Advances</th>
            <th>Final Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((payment, index) => (
            <tr key={index}>
              <td>{new Date(payment.created_at).toLocaleDateString()}</td>
              <td>{payment.finalTeaKilos} kg</td>
              <td>Rs. {payment.paymentPerKilo}</td>
              <td>Rs. {payment.advances}</td>
              <td>Rs. {payment.finalPayment}</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Component for Advance Details
const AdvanceDetails = ({ data }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((advance, index) => (
            <tr key={index}>
              <td>{new Date(advance.date).toLocaleDateString()}</td>
              <td>Rs. {advance.amount}</td>
              <td>{advance.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-summary">
        <p>Total Pending: Rs. {
          data.filter(a => a.action === 'Pending')
            .reduce((sum, item) => sum + parseFloat(item.amount), 0)
            .toFixed(2)
        }</p>
      </div>
    </div>
  );
};

// Component for Fertilizer Details
const FertilizerDetails = ({ data }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Fertilizer Type</th>
            <th>Quantity</th>
            <th>Payment Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((request, index) => (
            <tr key={index}>
              <td>{new Date(request.requestDate).toLocaleDateString()}</td>
              <td>{request.fertilizerType} ({request.packetType})</td>
              <td>{request.amount} packets</td>
              <td>{request.paymentoption}</td>
              <td>{request.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardFarmer;