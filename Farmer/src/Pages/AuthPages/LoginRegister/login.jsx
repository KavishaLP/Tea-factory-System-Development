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
      const response = await axios.post('http://localhost:8081/api/auth/fmr-login', values, {
        withCredentials: true,
      });
      console.log(response);

      if (response.data && response.data.Status === "Success") {
        console.log("JWT Token Received:", response.data.token);
        localStorage.setItem("token", response.data.token);
        navigate('/dashboard-farmer'); // Redirect after successful login
      } else {
        setError(response.data.Error || 'Invalid login credentials. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data);
        setError(error.response.data.message || 'Server error. Please try again.');
      } else if (error.inner) {
        // Handling validation errors
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setError(Object.values(validationErrors).join(', ')); // Show validation errors
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
    // Navigate to the forgot password page
    navigate('/forgot-password');
  };

  return (
    <div>
      
      <div className="signup-container">
        <div className="form-container">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin}>
            <div>
              <label>Username Or Mail Address:</label>
              <input
                type="text"
                name="usernamemail"
                value={values.usernamemail}
                onChange={handleChange}
                placeholder="Enter your username or mail addres"
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;