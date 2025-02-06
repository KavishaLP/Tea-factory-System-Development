import React, { useState } from "react";
import "./CFA.css";

const CreateFarmerAccount = () => {
  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contact, setContact] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== reenterPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(""); // Clear error if passwords match
    setIsLoading(true);

    setTimeout(() => {
      console.log("Farmer Details:", {
        userId,
        firstName,
        lastName,
        farmerName,
        registrationNumber,
        contact,
        mobile,
        password,
      });
      setIsLoading(false); // Reset loading state after submission
    }, 2000);
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Create Farmer Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Farmer Name</label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Registration Number</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Re-enter Password</label>
            <input
              type="password"
              value={reenterPassword}
              onChange={(e) => setReenterPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className={isLoading ? 'loading' : ''}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFarmerAccount;