import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { useEventContext } from "../EventContext.jsx";
import testimage from "../../assets/UALR-banner.jpg";

const CATEGORIES = [
  { id: 1, name: "Academic", icon: "📚", color: "#e0f2fe", text: "#0284c7" },
  { id: 2, name: "Social", icon: "🎉", color: "#fef08a", text: "#a16207" },
  { id: 3, name: "Sports", icon: "🏆", color: "#dcfce7", text: "#16a34a" },
  { id: 4, name: "Arts", icon: "🎨", color: "#f3e8ff", text: "#9333ea" },
  { id: 5, name: "Technology", icon: "💻", color: "#e2e8f0", text: "#475569" },
  { id: 6, name: "Career", icon: "💼", color: "#ffedd5", text: "#ea580c" }
];

export default function EventModal({
  event,
  onClose,
  onRegister,
  onShare,
  isRegistered,
  loading,
}) {
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const navigate = useNavigate();

  // 1. HOOKS MUST GO HERE AT THE VERY TOP!
  const { allRegistrations, allUsers } = useEventContext();

  // 2. EARLY RETURNS MUST GO AFTER ALL HOOKS
  if (!event) return null;

  const catData = CATEGORIES.find(
    (c) => c.name.toLowerCase() === (event.category || "").toLowerCase()
  ) || { icon: "📌", color: "#f3f4f6", text: "#374151" };

  const mapSrc = event?.location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
    : null;

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleRegisterClick = () => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      onClose();
      navigate("/login");
      return;
    }
    onRegister(event.id);
  };

  // ==========================================
  // REAL SOCIAL PROOF MATH
  // ==========================================
  const safeRegs = allRegistrations || [];
  const safeUsers = allUsers || [];
  const eventAttendees = safeRegs.filter((reg) => reg.eventId === event.id);

  let attendeeCount = eventAttendees.length;
  let displayAvatars = [];

  if (attendeeCount > 0) {
    displayAvatars = eventAttendees.slice(0, 3).map((reg) => {
      const user = safeUsers.find((u) => u.id === reg.userId);
      if (user) {
        const initials = `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase();
        return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&bold=true`;
      }
      return `https://ui-avatars.com/api/?name=U&background=random&color=fff&bold=true`;
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-banner">
          <img src={event.imageurl || testimage} alt={event.eventname} />
        </div>

        <div className="modal-body">
          <div className="modal-info">

            <div className="modal-header">
              <span
                className="modal-category-pill"
                style={{ backgroundColor: catData.color, color: catData.text }}
              >
                {catData.icon} {event.category || "General"}
              </span>
              <h2>{event.eventname}</h2>
            </div>

            <div className="modal-info-grid">
              <div className="info-item">
                <div>
                  <p className="info-label">Start Time</p>
                  <p className="info-value">{formatDate(event.starttime)}</p>
                </div>
              </div>
              <div className="info-item">
                <div>
                  <p className="info-label">End Time</p>
                  <p className="info-value">{formatDate(event.endtime)}</p>
                </div>
              </div>
              <div className="info-item">
                <div>
                  <p className="info-label">Location</p>
                  <p className="info-value">{event.location || "TBA"}</p>
                </div>
              </div>
            </div>

            {/* --- FIXED SOCIAL PROOF SECTION --- */}
            {attendeeCount > 0 ? (
              <div className="social-proof-container">
                <div className="social-proof-avatars">
                  {/* Changed mockAvatars to displayAvatars! */}
                  {displayAvatars.map((url, idx) => (
                    <img key={idx} src={url} alt="Attendee" className="social-avatar" />
                  ))}
                </div>
                <p className="social-proof-text">
                  {/* Changed mockAttendeeCount to attendeeCount! */}
                  <span className="social-highlight">{attendeeCount} students</span> are going
                </p>
              </div>
            ) : (
              <div className="social-proof-container">
                <p className="social-proof-text" style={{ color: '#10b981', fontWeight: '600' }}>
                  Be the first to register for this event!
                </p>
              </div>
            )}

            <div className="modal-description-section">
              <h3>About this Event</h3>
              <p className="event-desc">{event.eventdesc}</p>
            </div>

            <div className="modal-actions">
              {onRegister && (
                <button
                  className={`register-button ${isRegistered ? "registered" : ""}`}
                  onClick={handleRegisterClick}
                  disabled={loading}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                >
                  {isRegistered && isHoveringButton
                    ? "Unregister"
                    : isRegistered
                      ? "Registered"
                      : loading
                        ? "Registering..."
                        : "Register Now"}
                </button>
              )}

              <button className="share-button" onClick={(e) => { e.stopPropagation(); if (onShare) onShare(event); }}>
                Share Event
              </button>
            </div>
          </div>

          <div className="modal-map-sidebar">
            {mapSrc ? (
              <iframe
                src={mapSrc}
                className="modal-map-iframe"
                loading="lazy"
                title="Event Location Map"
              />
            ) : (
              <div className="no-map-placeholder">
                <p>📍 No map available for this location.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}