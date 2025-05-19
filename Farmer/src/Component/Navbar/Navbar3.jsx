import './Navbar.css';
import { FaUser } from 'react-icons/fa'; // Import FaUser icon

const Navbar = ({userId}) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* <img src={assets.logo}  alt="Logo" className="logo" /> */}
      </div>
      <div className="navbar-center">
        <i className="ri-menu-2-line"></i>
      </div>
      <div className="navbar-right">
        <i className="ri-notification-3-fill"></i>
        <div className="profile">
          <div className="profile-icon">
            <FaUser />
          </div>
          <span className="farmer-name">{userId}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
