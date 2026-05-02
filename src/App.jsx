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
import Map from "./pages/Map.jsx";

import notiBell from "./assets/notificationBell.png";
import logo from "./assets/ualr-logo.png";
import "../src/css/App.css";
import "./assets/edit-pencil.png";
import NotificationToast from "./pages/Components/NotificationToast.jsx";
import Footer from "./pages/Components/Footer.jsx";
import Welcome from "./pages/Welcome.jsx";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { dbUserId, allUsers } = useEventContext();

 // Generate dynamic avatar for the Navbar
  let navAvatarUrl = "https://ui-avatars.com/api/?name=U&background=ca1e4c&color=fff&bold=true";
  
  if (dbUserId && allUsers?.length > 0) {
    const currentUserData = allUsers.find(u => u.id === dbUserId);
    if (currentUserData) {
      const initials = `${currentUserData.firstname?.[0] || ""}${currentUserData.lastname?.[0] || ""}`.toUpperCase() || "U";
      navAvatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=ca1e4c&color=fff&bold=true`;
    }
  }

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

        {/* === 1. NAV LEFT: Logo & Title === */}
        <div className="nav-left">
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src={logo} alt="UA Little Rock Logo" />
            <h2 className="nav-title" style={{ margin: 0, color: "white" }}>UALR Campus Events</h2>
          </Link>
        </div>

        {/* === 2. NAV MIDDLE: Links (Hidden on mobile unless opened) === */}
        <div className={`nav-links ${isMobileMenuOpen ? "open" : ""}`}>
          {isSignedInUser ? (
            <>
              <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Events</Link>
              <Link to="/MyEvents" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Events</Link>
              <Link to="/map" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Map</Link>
              <Link to="/create" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Create Event</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>

        {/* === 3. NAV RIGHT: Icons & Hamburger === */}
        <div className="nav-icons">
          {isSignedInUser && (
            <>
              {/* NOTIFICATION BELL */}
              <Link to="/Notification" style={{ position: "relative" }}>
                <img src={notiBell} style={{ height: 28 }} alt="Notifications" />
                {unreadCount > 0 && (
                  <div className="notif-badge">{unreadCount}</div>
                )}
              </Link>

              {/* PROFILE DROPDOWN */}
              <div
                ref={profileRef}
                className="profile-dropdown-wrapper"
                style={{ position: "relative" }}
              >
                <img
                  src={navAvatarUrl}
                  className="profilepic-mobile"
                  alt="Profile"
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
            </>
          )}

          {/* HAMBURGER BUTTON (Always renders, hidden via CSS on desktop) */}
          <button
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* ================= TOAST ================= */}
      <NotificationToast />

      {/* ================= ROUTES ================= */}
      <div className="page" style={{ minHeight: "80vh" }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Events /></PageWrapper>} />
            <Route path="/MyEvents" element={<PageWrapper><MyEvents /></PageWrapper>} />
            <Route path="/create" element={<PageWrapper><CreateEvent /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/map" element={<PageWrapper><Map /></PageWrapper>} />
            <Route path="/Notification" element={<PageWrapper><Notification /></PageWrapper>} />
            <Route path="/UserProfile" element={<PageWrapper><UserProfile /></PageWrapper>} />
            <Route path="/welcome" element={<PageWrapper><Welcome /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
}