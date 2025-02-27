import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdateNewPassword.css';

const UpdateNewPassword = () => {
    const [password, setPassword] = useState('');
    const [compassword, setComPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
            // Add your password update logic here
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            navigate('/password-success'); // Redirect after successful update
        } catch (error) {
            setError('Error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
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
    );
};

export default UpdateNewPassword;
