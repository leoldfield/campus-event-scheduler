import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEventContext } from "./pages/EventContext.jsx";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MyEvents from "./pages/MyEvents.jsx";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import UserProfile from "./pages/UserProfile.jsx";
import Notification from "./pages/Notification.jsx";

import notiBell from "./assets/notificationBell.png";
import profilePicture from "./assets/johndoe.png";
import logo from "./assets/ualr-logo.png";
import "../src/css/App.css";
import NotificationToast from "./pages/Components/NotificationToast.jsx";

/* ================================
   FIXED PAGE WRAPPER (OUTSIDE APP)
================================ */
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { notifications } = useEventContext();
  const unreadCount = notifications.filter((n) => !n.seen).length;

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  /* ================================
     AUTH LISTENER
  ================================ */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  /* ================================
     CLICK OUTSIDE DROPDOWN (STABLE)
  ================================ */
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/">
            <img src={logo} style={{ height: 40 }} />
          </Link>
          <div className="nav-title">UA Little Rock Events</div>
        </div>

        <div className="nav-right">

          {/* AUTH LINKS */}
          {isSignedInUser ? (
            <>
              <Link to="/">Events</Link>
              <Link to="/MyEvents">My Events</Link>
              <Link to="/create">Create Event</Link>

              <Link to="/Notification" style={{ position: "relative" }}>
                <img src={notiBell} style={{ height: 28 }} />
                {unreadCount > 0 && (
                  <div className="notif-badge">{unreadCount}</div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {/* PROFILE DROPDOWN */}
          {isSignedInUser && (
            <div
              ref={profileRef}
              className="profile-dropdown-wrapper"
              style={{ position: "relative" }}
            >
              <img
                src={profilePicture}
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen((prev) => !prev);
                }}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="profile-dropdown"
                    initial={{ opacity: 0, scale: 0.85, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to="/UserProfile"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </Link>

                    <button onClick={handleLogout}>
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </nav>

      {/* ================= TOAST ================= */}
      <NotificationToast />

      {/* ================= ROUTES ================= */}
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