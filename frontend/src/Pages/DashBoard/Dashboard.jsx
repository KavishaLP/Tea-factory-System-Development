/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
//Dashboard

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUsers, 
  FaWeightHanging, 
  FaChevronLeft, 
  FaChevronRight,
  FaChartBar,
  FaChartLine,
  FaDollarSign,
  FaFilePdf,
  FaSpinner
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import "./Dashboard.css";
import { generateDashboardReport } from './DashboardPdf';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({userId}) => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeaWeight, setTotalTeaWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('day');
  const [chartLoading, setChartLoading] = useState(true);
  const [teaPriceData, setTeaPriceData] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [fertilizerData, setFertilizerData] = useState(null);
  const [teaInventory, setTeaInventory] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Tea price management states
  const [teaPrice, setTeaPrice] = useState(null);
  const [newTeaPrice, setNewTeaPrice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [priceLoading, setPriceLoading] = useState(false);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get current month and year in YYYY-MM format
  const getCurrentMonthYear = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Format month year for display
  const formatMonthYear = (monthYearStr) => {
    const [year, month] = monthYearStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Fetch current month's tea price
  const fetchTeaPrice = async () => {
    console.log(userId)
    try {
      const monthYear = getCurrentMonthYear();
      const response = await axios.get(
        `http://localhost:8081/api/manager/fetch-tea-price?month_year=${monthYear}`,
        { withCredentials: true }
      );
        
      if (response.data.price) {
        // Ensure we're storing a number
        setTeaPrice(parseFloat(response.data.price));
        setNewTeaPrice(response.data.price);
      } else {
        setTeaPrice(null);
      }
    } catch (error) {
      console.error("Error fetching tea price:", error);
      setMessage({
        text: "Failed to load tea price. Please try again.",
        type: "error"
      });
    }
  };

  // Update tea price
  const handleUpdateTeaPrice = async () => {
    if (!newTeaPrice || isNaN(newTeaPrice) || parseFloat(newTeaPrice) <= 0) {
      setMessage({
        text: "Please enter a valid price (greater than zero).",
        type: "error"
      });
      return;
    }

    setPriceLoading(true);
    try {
      const monthYear = getCurrentMonthYear();
      await axios.post(
        "http://localhost:8081/api/manager/update-tea-price", 
        {
          price: parseFloat(newTeaPrice),
          month_year: monthYear
        },
        { withCredentials: true }
      );

      setTeaPrice(parseFloat(newTeaPrice));
      setIsEditing(false);
      setMessage({
        text: "Tea price updated successfully!",
        type: "success"
      });

      // Refresh tea price history chart
      fetchTeaPriceHistory();

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating tea price:", error);
      setMessage({
        text: "Failed to update tea price. Please try again.",
        type: "error"
      });
    } finally {
      setPriceLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setNewTeaPrice(teaPrice || "");
    setIsEditing(false);
  };

  // Handle PDF report generation
  const handleGenerateReport = async () => {
    setIsGeneratingPdf(true);
    
    try {
      // Collect all the data needed for the report
      const dashboardData = {
        totalUsers,
        totalEmployees,
        totalTeaWeight,
        selectedDate,
        teaPrice
      };
      
      // Generate the PDF report
      await generateDashboardReport(
        dashboardData, 
        chartData, 
        timeRange, 
        teaPriceData, 
        fertilizerData, 
        teaInventory,
        chartType,
        "Tea Factory" // You can customize the factory name here
      );
      
      // Set success message
      setMessage({
        text: "Report generated successfully!",
        type: "success"
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setMessage({
        text: "Failed to generate report. Please try again.",
        type: "error"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, employeesRes] = await Promise.all([
          axios.get("http://localhost:8081/api/admin/fetch-total-users", { withCredentials: true }),
          axios.get("http://localhost:8081/api/manager/fetch-total-employees", { withCredentials: true })
        ]);

        setTotalUsers(usersRes.data.totalUsers);
        setTotalEmployees(employeesRes.data.totalEmployees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    fetchTeaPrice(); // Add this to fetch tea price on component mount
  }, []);

  useEffect(() => {
    const fetchTeaWeight = async () => {
      try {
        const dateString = formatDate(selectedDate);
        const res = await axios.get(
          `http://localhost:8081/api/admin/fetch-total-tea-weight?date=${dateString}`,
          { withCredentials: true }
        );
        setTotalTeaWeight(res.data?.totalWeight ?? null);
      } catch (error) {
        console.error("Error fetching tea weight:", error);
        setTotalTeaWeight(null);
      }
    };

    fetchTeaWeight();
  }, [selectedDate]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        let endpoint = '';
        let params = {};
        
        if (timeRange === 'day') {
          endpoint = 'fetch-daily-tea-weights';
          params = { days: 7 };
        } else if (timeRange === 'month') {
          endpoint = 'fetch-monthly-tea-weights';
          params = { months: 12 };
        } else if (timeRange === 'year') {
          endpoint = 'fetch-yearly-tea-weights';
          params = { years: 5 };
        }

        const res = await axios.get(
          `http://localhost:8081/api/admin/${endpoint}`,
          { params, withCredentials: true }
        );

        const labels = res.data.map(item => timeRange === 'day' 
          ? item.date 
          : timeRange === 'month' 
            ? item.month 
            : item.year);
        
        const data = res.data.map(item => item.totalWeight);

        setChartData({
          labels,
          datasets: [{
            label: 'Tea Weight (kg)',
            data,
            backgroundColor: '#27ae60',
            borderColor: '#27ae60',
            borderWidth: 2,
            tension: 0.1
          }]
        });
        setChartLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [timeRange]);

  const fetchTeaPriceHistory = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8081/api/manager/fetch-tea-price-history',
        { withCredentials: true }
      );

      const labels = res.data.map(item => item.month_year);
      const prices = res.data.map(item => item.price);

      setTeaPriceData({
        labels,
        datasets: [{
          label: 'Tea Price per Kilo (Rs)',
          data: prices,
          borderColor: '#e74c3c',
          backgroundColor: '#e74c3c',
          borderWidth: 2,
          tension: 0.1
        }]
      });
    } catch (error) {
      console.error("Error fetching tea price history:", error);
    }
  };

  useEffect(() => {
    fetchTeaPriceHistory();
  }, []);

  useEffect(() => {
    const fetchFertilizerDetails = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8081/api/manager/fetch-fertilizer-details',
          { withCredentials: true }
        );
        setFertilizerData(res.data);
      } catch (error) {
        console.error("Error fetching fertilizer details:", error);
      }
    };

    fetchFertilizerDetails();
  }, []);

  useEffect(() => {
    const fetchTeaInventory = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8081/api/manager/fetch-tea-inventory',
          { withCredentials: true }
        );
        setTeaInventory(res.data);
      } catch (error) {
        console.error("Error fetching tea inventory:", error);
      }
    };

    fetchTeaInventory();
  }, []);

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const today = new Date();
  const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));

  const isPrevDisabled = daysDiff >= 7;
  const isNextDisabled = selectedDate >= today;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Tea Weight Collection History',
        font: {
          size: 20,
          weight: 'bold',
        },
        padding: {
          bottom: 10
        }
      },
      subtitle: {
        display: true,
        text: `Overview of tea collection weights over time (${timeRange})`,
        color: '#666666',
        font: {
          size: 14,
          family: 'Inter',
          weight: '400',
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      },
      x: {
        title: {
          display: true,
          text: timeRange.charAt(0).toUpperCase() + timeRange.slice(1)
        }
      }
    },
  };

  const priceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Tea Price History',
        font: {
          size: 20,
          weight: 'bold',
        },
        padding: {
          bottom: 10
        }
      },
      subtitle: {
        display: true,
        text: 'Overview of tea price changes per kilogram',
        color: '#666666',
        font: {
          size: 14,
          family: 'Inter',
          weight: '400',
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (Rs)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    },
  };

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p className="dashboard-subtitle">System Overview</p>
        
        {/* PDF Download Button */}
        <button 
          className={`download-report-btn ${isGeneratingPdf ? 'generating' : ''}`} 
          onClick={handleGenerateReport}
          disabled={isGeneratingPdf || loading || chartLoading}
        >
          {isGeneratingPdf ? (
            <>
              <FaSpinner className="spinner-icon" /> Generating Report...
            </>
          ) : (
            <>
              <FaFilePdf /> Download Dashboard Report
            </>
          )}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Tea kilo updating and view */}
          <div className="tea-price-section">
            <div className="tea-price-card">
              <h3>Tea Price for {formatMonthYear(getCurrentMonthYear())}</h3>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              {!isEditing ? (
                <div className="tea-price-display">
                  <div className="current-price">
                    {teaPrice !== null ? (
                      <>
                        <span className="price-label">Current Price:</span>
                        <span className="price-value">Rs. {Number(teaPrice).toFixed(2)}/kg</span>
                      </>
                    ) : (
                      <span className="no-price">No price set for this month</span>
                    )}
                  </div>
                  <button 
                    className="edit-price-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    {teaPrice ? "Update Price" : "Set Price"}
                  </button>
                </div>
              ) : (
                <div className="tea-price-edit">
                  <div className="price-input-group">
                    <label htmlFor="teaPrice">Enter Tea Price (Rs/kg)</label>
                    <input
                      type="number"
                      id="teaPrice"
                      value={newTeaPrice}
                      onChange={(e) => setNewTeaPrice(e.target.value)}
                      placeholder="Enter price per kg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="price-actions">
                    <button 
                      className="save-price-btn"
                      onClick={handleUpdateTeaPrice}
                      disabled={priceLoading}
                    >
                      {priceLoading ? "Saving..." : "Save Price"}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={priceLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="metrics-row">
            {/* Total Users */}
            <div className="metric-card">
              <div className="card-icon users-icon">
                <FaUsers />
              </div>
              <div className="card-content">
                <h3>Total Farmers</h3>
                <p className="card-value">{totalUsers}</p>
                <p className="card-description">Registered accounts</p>
              </div>
            </div>

            {/* Total Tea Weight */}
            <div className="metric-card tea-weight-card">
              <div className="tea-weight-content">
                <div className="date-navigation">
                  <button 
                    onClick={handlePrev} 
                    disabled={isPrevDisabled}
                    className="nav-button"
                  >
                    <FaChevronLeft />
                  </button>
                  <span>{formatDate(selectedDate)}</span>
                  <button 
                    onClick={handleNext} 
                    disabled={isNextDisabled}
                    className="nav-button"
                  >
                    <FaChevronRight />
                  </button>
                </div>
                <div className="tea-weight-value">
                  <div className="tea-weight-icon">
                    <FaWeightHanging />
                  </div>
                  <div>
                    <h3>Total Tea Weight</h3>
                    <p className="card-value">
                      {totalTeaWeight !== null ? `${totalTeaWeight} kg` : 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="card-description">Final weight collected</p>
              </div>
            </div>

            {/* Employee Accounts */}
            <div className="metric-card">
              <div className="card-icon employees-icon">
                <FaUsers />
              </div>
              <div className="card-content">
                <h3>Employee Accounts</h3>
                <p className="card-value">{totalEmployees}</p>
                <p className="card-description">Total employees</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content-area">
            <div className="chart-controls">
              <div className="chart-type-toggle">
                <button 
                  className={chartType === 'bar' ? 'active' : ''}
                  onClick={() => setChartType('bar')}
                >
                  <FaChartBar className="chart-icon" />
                  Bar Chart
                </button>
                <button 
                  className={chartType === 'line' ? 'active' : ''}
                  onClick={() => setChartType('line')}
                >
                  <FaChartLine className="chart-icon" />
                  Line Chart
                </button>
              </div>
              <div className="time-range-toggle">
                <button 
                  className={timeRange === 'day' ? 'active' : ''}
                  onClick={() => setTimeRange('day')}
                >
                  Daily
                </button>
                <button 
                  className={timeRange === 'week' ? 'active' : ''} // Fixed from 'day' to 'week'
                  onClick={() => setTimeRange('week')}
                >
                  Weekly
                </button>
                <button 
                  className={timeRange === 'month' ? 'active' : ''}
                  onClick={() => setTimeRange('month')}
                >
                  Monthly
                </button>
                <button 
                  className={timeRange === 'year' ? 'active' : ''}
                  onClick={() => setTimeRange('year')}
                >
                  Yearly
                </button>
              </div>
            </div>
            
            <div className="chart-container">
              {chartLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading chart data...</p>
                </div>
              ) : chartData ? (
                chartType === 'bar' ? (
                  <Bar data={chartData} options={options} />
                ) : (
                  <Line data={chartData} options={options} />
                )
              ) : (
                <div className="no-data-message">
                  No tea weight data available
                </div>
              )}
            </div>
            <div className="chart-container">
              {teaPriceData ? (
                <Line data={teaPriceData} options={priceChartOptions} />
              ) : (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading price history...</p>
                </div>
              )}
            </div>
            <div className="fertilizer-section">
              <h2>Fertilizer Details</h2>
              {fertilizerData ? (
                <div className="table-responsive">
                  <table className="fertilizer-table">
                    <thead>
                      <tr>
                        <th>Fertilizer Type</th>
                        <th>Packet Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(fertilizerData.reduce((acc, item) => {
                        if (!acc[item.fertilizerType]) {
                          acc[item.fertilizerType] = {
                            type: item.fertilizerType,
                            packets: []
                          };
                        }
                        acc[item.fertilizerType].packets.push({
                          size: item.packetType,
                          price: item.price
                        });
                        return acc;
                      }, {})).map((group, index) => (
                        <tr key={index} className="fertilizer-group">
                          <td className="fertilizer-type">{group.type}</td>
                          <td className="packet-details">
                            <div className="packet-grid">
                              {group.packets.map((packet, pIndex) => (
                                <div key={pIndex} className="packet-item">
                                  <span className="packet-size">{packet.size}</span>
                                  <span className="packet-price">Rs. {Number(packet.price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading fertilizer data...</p>
                </div>
              )}
            </div>
            <div className="tea-inventory-section">
              <h2>Tea Packets Inventory</h2>
              {teaInventory ? (
                <div className="table-responsive">
                  <table className="tea-inventory-table">
                    <thead>
                      <tr>
                        <th>Tea Type</th>
                        <th>Available Packets</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(teaInventory.reduce((acc, item) => {
                        if (!acc[item.tea_type]) {
                          acc[item.tea_type] = {
                            type: item.tea_type,
                            packets: [],
                            lastUpdated: new Date(item.last_updated)
                          };
                        }
                        acc[item.tea_type].packets.push({
                          size: item.packet_size,
                          count: item.packet_count
                        });
                        // Keep the most recent update date
                        const itemDate = new Date(item.last_updated);
                        if (itemDate > acc[item.tea_type].lastUpdated) {
                          acc[item.tea_type].lastUpdated = itemDate;
                        }
                        return acc;
                      }, {})).map((group, index) => (
                        <tr key={index} className="inventory-group">
                          <td className="tea-type">{group.type}</td>
                          <td className="packet-details">
                            <div className="packet-grid">
                              {group.packets.map((packet, pIndex) => (
                                <div key={pIndex} className="packet-item">
                                  <span className="packet-size">{packet.size}</span>
                                  <span className="packet-count">{packet.count} packets</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="last-updated">
                            {new Date(group.lastUpdated).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading tea inventory...</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;