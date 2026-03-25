import React from "react";
import "./Register.css";

export default function Register() {
  return (
    <div className="register-page">
      <div className="register-wrapper">
        <div className="register-left-accent"></div>

        <div className="register-card">
          <h1>Register</h1>
          <p>Create account (placeholder).</p>

          <label>Name</label>
          <input placeholder="name" />

          <label>Email</label>
          <input placeholder="email" />

          <label>Password</label>
          <input type="password" placeholder="password" />

          <button>Create Account</button>
        </div>
      </div>
    </div>
  );
}
