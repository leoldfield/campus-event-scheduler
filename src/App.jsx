import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MyEvents from "./pages/MyEvents.jsx"
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import UserProfile from "./pages/UserProfile.jsx";
import Notification from "./pages/Notification.jsx";

import notiBell from "./assets/notificationBell.png";
import profilePicture from "./assets/johndoe.png"
import logo from "./assets/ualr-logo.png";
import "../src/css/App.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const pageAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  function PageWrapper({ children }) {
    return <motion.div {...pageAnimation}>{children}</motion.div>;
  }

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
          <Link to="/MyEvents">My Events</Link>
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

      {/* CONSTRAINED CONTENT */}
      <div className="page">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Events /></PageWrapper>} />
            <Route path="/MyEvents" element={<PageWrapper><MyEvents /></PageWrapper>} />
            <Route path="/create" element={<PageWrapper><CreateEvent /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/Notification" element={<PageWrapper><Notification /></PageWrapper>} />
            <Route path="/UserProfile" element={<PageWrapper><UserProfile /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
}
