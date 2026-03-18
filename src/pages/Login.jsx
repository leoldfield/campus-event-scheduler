import React from "react";

export default function Login() {
    return (
      <div className="page">
        <h1>Login</h1>
        <p>Student login page (placeholder).</p>
  
        <label>Email</label><br />
        <input className="input" placeholder="email" />
  
        <label>Password</label><br />
        <input className="input" type="password" placeholder="password" />
  
        <button className="button">Login</button>
      </div>
    );
  } 