import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMarkEmailRead } from 'react-icons/md'; // Import email icon
import './CheckMail.css';

const CheckMail = () => {
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30); // 30 seconds countdown
    const [isTimerActive, setIsTimerActive] = useState(true);

    useEffect(() => {
        let interval = null;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timer, isTimerActive]);

    const handleResendCode = async () => {
        setIsResending(true);
        setMessage('');

        try {
            // Add your resend code logic here
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMessage('Verification code has been resent to your email');
            setTimer(30);
            setIsTimerActive(true);
        } catch (error) {
            setMessage('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleCodeChange = (index, value) => {
        if (value.length <= 1 && /^[0-9]*$/.test(value)) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setMessage('Please enter the complete 6-digit code');
            return;
        }

        try {
            // Add your verification logic here
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate('/reset-password'); // Navigate to reset password page
        } catch (error) {
            setMessage('Invalid verification code. Please try again.');
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
                    <h2>Enter Verification Code</h2>
                    <p className="mail-instruction">
                        We have sent a verification code to your email address.
                        Please enter the 6-digit code below.
                    </p>

                    <div className="verification-code-container">
                        {verificationCode.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="code-input"
                            />
                        ))}
                    </div>

                    {message && (
                        <div className={`message ${message.includes('Invalid') || message.includes('Failed') ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}

                    <div className="action-buttons">
                        <button 
                            className="verify-button"
                            onClick={handleVerifyCode}
                        >
                            Verify Code
                        </button>

                        <div className="resend-section">
                            <button 
                                className="resend-button" 
                                onClick={handleResendCode}
                                disabled={isResending || timer > 0}
                            >
                                {isResending ? 'Resending...' : 'Resend Code'}
                            </button>
                            {timer > 0 && (
                                <span className="timer">({timer}s)</span>
                            )}
                        </div>

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