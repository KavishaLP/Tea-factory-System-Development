import { useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import './ForgetPasswordSuccess.css';

const ForgetPasswordSuccess = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="upper-bar">
                <h1>Tea Factory Management System</h1>
            </div>
            <div className="password-success-container">
                <div className="success-content">
                    <div className="icon-container">
                        <MdCheckCircle className="success-icon" />
                    </div>
                    <h2>Password Updated Successfully!</h2>
                    <p className="success-message">
                        Your password has been changed successfully. 
                        You can now use your new password to login to your account.
                    </p>

                    <div className="action-button">
                        <button 
                            className="login-button"
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

export default ForgetPasswordSuccess;
