// src/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    userId: null,
    name: null
  });

  useEffect(() => {
    const verifyToken = async () => {
      console.log('Verifying token...');
      try {
        const response = await axios.post('http://localhost:8081/verify-token', {}, { 
          withCredentials: true 
        });
        
        console.log('Token verified:', response.data);
        setUserData({
          userId: response.data.userId,
          name: response.data.name
        });
        setLoading(false);
      } catch (error) {
        console.error('Token verification failed:', error);
        navigate('/');
      }
    };
    
    verifyToken();
  }, [navigate]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Clone children and pass userData as props
  return (
    <>
      {React.Children.map(children, child => {
        // Make sure child is a valid React element before cloning
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            userId: userData.userId,
            userName: userData.name 
          });
        }
        return child;
      })}
    </>
  );
};

export default ProtectedRoute;