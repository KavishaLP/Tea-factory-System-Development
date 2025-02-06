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
            {[
              { href: '/privacy', text: 'Privacy Policy' },
              { href: '/terms', text: 'Terms of Service' },
              { href: '/contact', text: 'Contact Us' }
            ].map((link, index) => (
              <li key={link.href} style={{ '--item-index': index }}>
                <a href={link.href}>{link.text}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;