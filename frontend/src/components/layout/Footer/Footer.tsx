import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p className="footer-text">
            © {currentYear} Jira Clone. All rights reserved.
          </p>
        </div>

        <div className="footer-right">
          <a href="#" className="footer-link">Privacy Policy</a>
          <span className="footer-separator">•</span>
          <a href="#" className="footer-link">Terms of Service</a>
          <span className="footer-separator">•</span>
          <a href="#" className="footer-link">Help Center</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;