import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaWeightHanging } from 'react-icons/fa';
import { FaMoneyBillWave } from 'react-icons/fa';
import "./DashboardAdmin.css";

const DashboardAdmin = () => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeaWeight, setTotalTeaWeight] = useState(null); // Initialize as null
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

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
        const dateString = formatDate(selectedDate); // Format the selected date
        const res = await axios.get(
          `http://localhost:8081/api/admin/fetch-total-tea-weight?date=${dateString}`,
          { withCredentials: true }
        );

        // Log the response for debugging
        console.log("Tea Weight API Response:", res.data);

        // Ensure we set the total weight or fallback to null if not present
        setTotalTeaWeight(res.data?.totalWeight ?? null);
      } catch (error) {
        console.error("Error fetching tea weight:", error);
        setTotalTeaWeight(null); // Explicitly set to null on error
      }
    };

    fetchTeaWeight();
  }, [selectedDate]);

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
            {/* Additional components will go here */}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;