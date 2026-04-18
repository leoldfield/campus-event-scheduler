import React, { useState, useEffect } from "react";
import logo from "./assets/ualr-logo.png";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "../src/css/App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import UserProfile from "./pages/UserProfile.jsx";
import Notification from "./pages/Notification.jsx";
import notiBell from "./assets/notificationBell.png";
import profilePicture from "./assets/johndoe.png"

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);
  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <img src={logo} style={{ height: 40 }} />
          <div className="nav-title">
            UA Little Rock Events
          </div>
        </div>

        <div className="nav-right">
          <Link to="/">Events</Link>
          <Link to="/create">Create</Link>
          {isSignedInUser ? (
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          <Link to="/Notification">
            <img src={notiBell} style={{ height: 28 }} />
          </Link>
          <Link to="/UserProfile">
            <img src={profilePicture} style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover' }} />
          </Link>
        </div>
      </nav>

      {/* ✅ CONSTRAINED CONTENT */}
      <div className="page">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Notification" element={<Notification />} />
          <Route path="/UserProfile" element={<UserProfile />} />
        </Routes>
      </div>
    </>
  );
}
