/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
//Dashboard

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaWeightHanging, FaChartBar, FaChartLine } from 'react-icons/fa';
import { FaMoneyBillWave } from 'react-icons/fa';
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

const Dashboard = () => {
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
        text: `Tea Weight by ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`,
      },
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
                <h3>Total Users</h3>
                <p className="card-value">{totalUsers}</p>
                <p className="card-description">Registered accounts</p>
              </div>
            </div>

            {/* Total Tea Weight */}
            <div className="metric-card tea-weight-card">
              <div className="tea-weight-content">
                <div className="date-navigation">
                  <button onClick={handlePrev} disabled={isPrevDisabled}>Prev</button>
                  <span>{formatDate(selectedDate)}</span>
                  <button onClick={handleNext} disabled={isNextDisabled}>Next</button>
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
                  className={chartType === 'bar' ? 'active' : ''}
                  onClick={() => setChartType('bar')}
                >
                  <FaChartBar /> Bar Chart
                </button>
                <button 
                  className={chartType === 'line' ? 'active' : ''}
                  onClick={() => setChartType('line')}
                >
                  <FaChartLine /> Line Chart
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
                  className={timeRange === 'day' ? 'active' : ''}
                  onClick={() => setTimeRange('day')}
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
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;