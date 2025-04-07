// src/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // wait until token is checked

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get('/verify-token', { withCredentials: true }); // your backend route to verify
        setLoading(false);
      } catch (error) {
        console.log('Invalid token. Redirecting to login...');
        navigate('/'); // redirect to login
      }
    };

    verifyToken();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // You can show a spinner here if you want
  }

  return children;
};

export default ProtectedRoute;
