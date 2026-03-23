import React from "react";
import logo from "./assets/ualr-logo.png";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import UserProfile from "./pages/UserProfile.jsx";

export default function App() {
  return (
    <div className="page">
<nav className="navbar">
  <div className="nav-left">
    <img src={logo} style={{ height: 40 }} />
    <strong>UA Little Rock Events</strong>
  </div>

  <div className="nav-right">
    <Link to="/">Events</Link>
    <Link to="/create">Create Event</Link>
    <Link to="/login">Login</Link>
    <Link to="/register">Register</Link>
    <Link to="/UserProfile">Profile</Link>
  </div>
</nav>

      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/UserProfile" element={<UserProfile />}/>
      </Routes>
    </div>
  );
}