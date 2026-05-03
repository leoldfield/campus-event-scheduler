import React from "react";
import { Link } from "react-router-dom";
import "../../css/Footer.css"; // Adjust path based on your folder structure

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Brand Section */}
        <div className="footer-section">
          <h3>UA Little Rock Events</h3>
          <p>Discover, register, and manage upcoming campus events easily and stay connected with the Trojan community.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/MyEvents">My Events</Link></li>
            <li><Link to="/map">Campus Map</Link></li>
            <li><Link to="/calendar">Calendar</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: events@ualr.edu</p>
          <p>Phone: (501) 916-3000</p>
          <p>Location: 2801 S University Ave,<br/>Little Rock, AR 72204</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} UA Little Rock. All rights reserved.</p>
      </div>
    </footer>
  );
}