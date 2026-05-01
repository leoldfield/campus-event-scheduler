import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        
        <div className="welcome-header">
          <h1>Welcome to UA Little Rock Campus Events!</h1>
          <p>You are successfully registered and ready to go.</p>
        </div>

        <div className="welcome-features">
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>Discover</h3>
            <p>Find upcoming campus events tailored to your interests and major.</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">✅</div>
            <h3>Register</h3>
            <p>Secure your spot at workshops, social gatherings, and study groups.</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📅</div>
            <h3>Sync</h3>
            <p>Automatically add registered events directly to your Google Calendar.</p>
          </div>
        </div>

        <button 
          className="welcome-cta-button"
          onClick={() => navigate("/")}
        >
          Explore Events Now
        </button>

      </div>
    </div>
  );
}