// src/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      console.log('Verifying token...');
      try {
        const response = await axios.post('http://localhost:8081/verify-token', {}, { 
          withCredentials: true 
        });
        
        console.log('Token verified, userId:', response.data.userId);
        setUserId(response.data.userId);
        setLoading(false);
      } catch (error) {
        console.log('Invalid token. Redirecting to login...');
        navigate('/');
      }
    };
    
    verifyToken();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Clone children and pass userId as prop
  return (
    <>
      {React.Children.map(children, child => {
        return React.cloneElement(child, { userId });
      })}
    </>
  );
};

export default ProtectedRoute;