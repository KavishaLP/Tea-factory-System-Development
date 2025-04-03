import './login.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ usernamemail: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log(values)
    try {
      const response = await axios.post('http://localhost:8081/api/auth/admn-login', values, {
        withCredentials: true,
      });
      console.log(response);

      if (response.data && response.data.Status === "Success") {
        console.log("JWT Token Received:", response.data.token);
        localStorage.setItem("token", response.data.token);
        navigate('/admin-dashboard-admin');
      } else {
        setError(response.data.Error || 'Invalid login credentials. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data);
        setError(error.response.data.message || 'Server error. Please try again.');
      } else if (error.inner) {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setError(Object.values(validationErrors).join(', '));
      } else {
        console.error('Login error:', error);
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="tfms-login__wrapper">
      <div className="tfms-login__header-bar">
        <h1 className="tfms-login__title">Tea Factory Management System</h1>
      </div>

      <div className="tfms-login__main-container">
        <div className="tfms-login__form-container">
          <h2 className="tfms-login__form-title">Login</h2>
          {error && <p className="tfms-login__error-message">{error}</p>}
          <form className="tfms-login__form" onSubmit={handleLogin}>
            <div className="tfms-login__input-group">
              <label className="tfms-login__label">Username Or Mail Address:</label>
              <input
                type="text"
                name="usernamemail"
                value={values.usernamemail}
                onChange={handleChange}
                placeholder="Enter your username or mail address"
                className="tfms-login__input"
                required
              />
            </div>
            <div className="tfms-login__input-group">
              <label className="tfms-login__label">Password:</label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="tfms-login__input"
                required
              />
            </div>
            <button type="submit" className="tfms-login__submit-btn">Login</button>
          </form>
          <div className="tfms-login__footer-links">
            <button 
              onClick={handleForgotPassword} 
              className="tfms-login__forgot-password"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;