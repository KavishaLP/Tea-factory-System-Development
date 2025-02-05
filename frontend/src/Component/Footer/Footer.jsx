// Footer.jsx
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <p>&copy; {new Date().getFullYear()} YourCompany. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
