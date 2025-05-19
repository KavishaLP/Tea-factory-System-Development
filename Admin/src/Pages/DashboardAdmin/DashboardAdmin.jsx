import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUsers, FaWeightHanging, FaChartBar, FaChartLine, FaCalendarAlt,
  FaArrowLeft, FaArrowRight, FaMoneyBillWave 
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
import "./DashboardAdmin.css";

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

const DashboardAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeaWeight, setTotalTeaWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('day');
  const [chartLoading, setChartLoading] = useState(true);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, requestsRes] = await Promise.all([
          axios.get("http://localhost:8081/api/admin/fetch-total-users", { withCredentials: true }),
          axios.get("http://localhost:8081/api/admin/fetch-pending-requests", { withCredentials: true })
        ]);

        setTotalUsers(usersRes.data.totalUsers);
        setPendingRequests(requestsRes.data.count);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user/request data:", error);
        setLoading(false);
      }
    };

    fetchData();
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
            backgroundColor: 'rgba(39, 174, 96, 0.6)',
            borderColor: '#27ae60',
            borderWidth: 2,
            tension: 0.3,
            fill: chartType === 'line' ? 'origin' : undefined,
            pointBackgroundColor: '#27ae60',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        });
        setChartLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [timeRange, chartType]);

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

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const today = new Date();
  const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));

  const isPrevDisabled = daysDiff >= 7;
  const isNextDisabled = selectedDate >= today;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            size: 13
          }
        }
      },
      title: {
        display: true,
        text: 'Tea Weight Collection History',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 5
        }
      },
      subtitle: {
        display: true,
        text: `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Overview`,
        color: '#666666',
        font: {
          size: 14,
          weight: 'normal',
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderDash: [5, 5],
        },
        ticks: {
          font: {
            size: 12
          },
          padding: 8
        },
        title: {
          display: true,
          text: 'Weight (kg)',
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: {
            bottom: 10
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: timeRange.charAt(0).toUpperCase() + timeRange.slice(1),
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: {
            top: 10
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">System Overview</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
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
              <div className="tea-weight-header">
                <h3><FaWeightHanging /> Total Tea Weight</h3>
              </div>
              <div className="tea-weight-content">
                <div className="date-navigation">
                  <button 
                    className="nav-button" 
                    onClick={handlePrev} 
                    disabled={isPrevDisabled}
                    title="Previous Day"
                  >
                    <FaArrowLeft />
                  </button>
                  
                  <div className="date-picker-container">
                    <FaCalendarAlt className="calendar-icon" />
                    <input 
                      type="date" 
                      value={formatDate(selectedDate)}
                      onChange={handleDateChange}
                      max={formatDate(today)}
                      className="date-input"
                    />
                    <span className="formatted-date">{formatDisplayDate(selectedDate)}</span>
                  </div>
                  
                  <button 
                    className="nav-button" 
                    onClick={handleNext} 
                    disabled={isNextDisabled}
                    title="Next Day"
                  >
                    <FaArrowRight />
                  </button>
                </div>
                
                <p className="tea-weight-display">
                  {totalTeaWeight !== null ? (
                    <><span className="tea-weight-value">{totalTeaWeight}</span> <span className="tea-weight-unit">kg</span></>
                  ) : (
                    <span className="no-data">No data available</span>
                  )}
                </p>
                <p className="card-description">Final weight collected</p>
              </div>
            </div>

            {/* Pending Advance Requests */}
            <div className="metric-card">
              <div className="card-icon requests-icon">
                <FaMoneyBillWave />
              </div>
              <div className="card-content">
                <h3>Pending Advance Requests</h3>
                <p className="card-value">{pendingRequests}</p>
                <p className="card-description">Awaiting approval</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content-area">
            <div className="chart-controls">
              <div className="chart-type-toggle">
                <button 
                  className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  <FaChartBar /> Bar Chart
                </button>
                <button 
                  className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => setChartType('line')}
                >
                  <FaChartLine /> Line Chart
                </button>
              </div>
              <div className="time-range-toggle">
                <button 
                  className={`time-btn ${timeRange === 'day' ? 'active' : ''}`}
                  onClick={() => setTimeRange('day')}
                >
                  Daily
                </button>
                <button 
                  className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  Weekly
                </button>
                <button 
                  className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeRange('month')}
                >
                  Monthly
                </button>
                <button 
                  className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
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
                  <FaChartBar className="no-data-icon" />
                  <p>No tea weight data available</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;