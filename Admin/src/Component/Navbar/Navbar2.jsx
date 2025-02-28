import './Navbar.css';
// import assets from '../../assets/assets.js';

const Navbar = () => {
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
          {/* <img src={assets.profile} alt="Profile" className="profile-img" /> */}
          <span className="admin-name">Admin Name</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
