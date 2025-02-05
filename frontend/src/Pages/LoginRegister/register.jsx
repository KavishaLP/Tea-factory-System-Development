import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { registerValidationSchema } from './validationSchema'
import './register.css'



const Register = () => {
  const navigate = useNavigate();

  // Object to send
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    compassword:''
  });

  const handleRegister = (event) => {
    event.preventDefault();
    
    registerValidationSchema
      .validate(values)
      .then(() => {
        axios.post('http://localhost:8081/auth/register', values)
          .then(res => {
            console.log(res);
            navigate('/login');
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err.errors); // Handle validation errors
        alert(err.errors[0]); // Show first validation error in an alert
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value // Correctly updating state using dynamic keys
    });
  };

  return (
    <div className="signup-container"> {/* Reusing signup-container */}
      <div className="form-container"> {/* Reusing form-container */}
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>
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
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              name="compassword"
              value={values.compassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
  
        <div className="navigate-login">
          <p>Already have an account?</p>
          <Link to="/signin">Login</Link>
        </div>

      </div>
    </div>
  );
  
  
};

export default Register;
