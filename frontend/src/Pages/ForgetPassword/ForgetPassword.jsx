import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgetPassword.css';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            // Add your password reset logic here
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate('/check-mail');
        } catch (error) {
            setMessage('Error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="upper-bar">
                <h1>Tea Factory Management System</h1>
            </div>
            <div className="forgot-password-container">
                <div className="form-container">
                    <h2>Forgot Password</h2>
                    <p className="instruction">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {message && (
                            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                                {message}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div className="back-to-login">
                            <button 
                                type="button" 
                                className="back-button"
                                onClick={() => navigate('/')}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ForgetPassword;
