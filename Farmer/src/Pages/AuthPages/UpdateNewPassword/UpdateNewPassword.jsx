import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UpdateNewPassword.css';

const UpdateNewPassword = () => {
    const [password, setPassword] = useState('');
    const [compassword, setComPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== compassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            // Send email, password, and confirm password to the backend
            const response = await fetch('http://localhost:8081/api/auth/mng-update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    compassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Navigate to success page if password updated successfully
                navigate('/password-success');
            } else {
                setError(data.message || 'Error occurred while updating the password.');
            }
        } catch (error) {
            setError('Error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="upper-bar">
                <h1>Tea Factory Management System</h1>
            </div>
            <div className="update-password-container">
                <div className="form-container">
                    <h2>Update Password</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Confirm Password:</label>
                            <input
                                type="password"
                                value={compassword}
                                onChange={(e) => setComPassword(e.target.value)}
                                placeholder="Re-enter your new password"
                                required
                            />
                        </div>
                        <div className="button-group">
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UpdateNewPassword;
