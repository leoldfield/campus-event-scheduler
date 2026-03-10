import React from "react";

export default function Register() {
    return (
      <div style={{ padding: 24 }}>
        <h1>Register</h1>
        <p>Create account (placeholder).</p>
  
        <label>Name</label><br />
        <input placeholder="name" /><br /><br />
  
        <label>Email</label><br />
        <input placeholder="email" /><br /><br />
  
        <label>Password</label><br />
        <input type="password" placeholder="password" /><br /><br />
  
        <button>Create Account</button>
      </div>
    );
  }
  