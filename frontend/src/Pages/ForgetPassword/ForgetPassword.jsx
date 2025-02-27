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
            const response = await fetch('http://localhost:8081/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setMessage('Reset code sent to your email.');
                setTimeout(() => {
                    navigate('/check-mail', { state: { email } });
                }, 2000);
            } else {
                setMessage(data.message || 'Error occurred. Please try again.');
            }
        } catch (error) {
            setMessage('Server error. Please try again later.');
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

                        <div className="button-group">
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            
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
