import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMarkEmailRead } from 'react-icons/md'; // Import email icon
import './CheckMail.css';

const CheckMail = () => {
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResendEmail = async () => {
        setIsResending(true);
        setMessage('');

        try {
            // Add your resend email logic here
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMessage('Reset link has been resent to your email');
        } catch (error) {
            setMessage('Failed to resend email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            <div className="upper-bar">
                <h1>Tea Factory Management System</h1>
            </div>
            <div className="check-mail-container">
                <div className="mail-content">
                    <div className="icon-container">
                        <MdMarkEmailRead className="email-icon" />
                    </div>
                    <h2>Check Your Mail</h2>
                    <p className="mail-instruction">
                        We have sent a password recovery link to your email address.
                        Please check your inbox and follow the instructions.
                    </p>

                    {message && (
                        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}

                    <div className="action-buttons">
                        <button 
                            className="resend-button" 
                            onClick={handleResendEmail}
                            disabled={isResending}
                        >
                            {isResending ? 'Resending...' : 'Resend Email'}
                        </button>

                        <button 
                            className="back-button"
                            onClick={() => navigate('/')}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckMail; 