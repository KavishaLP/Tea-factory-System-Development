import './login.css';

import { Link, useNavigate } from 'react-router-dom';

import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();

  // Object to send
  const [values, setValues] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (event) => {
    event.preventDefault();

    const adminCredentials = {
      email: 'admin@example.com',
      password: 'admin'
    };

    const userCredentials = {
      email: 'user@example.com',
      password: 'user'
    };

    if (values.email === adminCredentials.email && values.password === adminCredentials.password) {
      alert('Admin logged in');
      navigate('/admin-dashboard');
    } else if (values.email === userCredentials.email && values.password === userCredentials.password) {
      alert('User logged in');
      navigate('/user-dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value // Correctly updating state using dynamic keys
    });
  };

  return (
    <div className="signup-container">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Enter your email"
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

        <div className="navigate-register">
          <p>Dont have an account?</p>
          <Link to="/signup">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
