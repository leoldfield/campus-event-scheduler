import React from "react";
import "./Login.css";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-left-accent"></div>

        <div className="login-card">
          <h1>Login</h1>
          <p>Student login page (placeholder).</p>

          <label>Email</label>
          <input type="email" placeholder="email" />

          <label>Password</label>
          <input type="password" placeholder="password" />

          <button>Login</button>
        </div>
      </div>
    </div>
  );
}