import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; 
import { useEventContext } from "../EventContext.jsx";
import "../../css/Events.css";
import pencil from "../../assets/edit-pencil.png";
import testimage from "../../assets/UALR-banner.jpg";

export default function EventCard({
  event,
  onEdit,
  showEdit = false,
  isRegistered,
  onRegister,
  onShare,
  onOpen,
  loading,
  showRegister = true,
}) {
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const navigate = useNavigate();
  const { allRegistrations, allUsers } = useEventContext();

  const handleCardClick = () => {
    if (onOpen) onOpen(event);
  };

  // ==========================================
  // AUTH CHECK: Intercept the Registration Click
  // ==========================================
  const handleRegisterClick = (e) => {
    e.stopPropagation(); // Prevents the card from opening the modal!
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      navigate("/login");
      return;
    }
    if (onRegister) onRegister(event.id);
  };

  // ==========================================
  // REAL SOCIAL PROOF MATH
  // ==========================================
  const safeRegs = allRegistrations || [];
  const safeUsers = allUsers || [];
  const eventAttendees = safeRegs.filter((reg) => reg.eventId === event.id);
  
  let attendeeCount = eventAttendees.length;
  let displayAvatars = [];

  // Generate real UI-Avatars from the DB users
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  };
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      <div className="event-card-image">
        <img src={event.imageUrl || testimage} alt={event.eventname || "Event Banner"} className="event-card-img" />
      </div>

      <div className="event-card-content">
        <div className="event-card-date-row">
          <div className="event-card-date">
            <span className="pill">{formatDate(event.starttime)}</span>
            <span className="pill">{formatTime(event.starttime)}</span>
            {event.category && (
              <span className={`event-category-pill cat-${event.category.toLowerCase()}`}>{event.category}</span>
            )}
          </div>
          {showEdit && (
            <button className="edit-icon-button" onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(event); }} title="Edit Event">
              <img src={pencil} alt="Edit" className="edit-pencil" height="25" width="25" />
            </button>
          )}
        </div>

        <p className="event-tagline">EVENT</p>
        <h2 className="event-title">{event.eventname}</h2>

        {/* --- NEW SOCIAL PROOF FOR CARDS --- */}
        {attendeeCount > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', marginTop: '10px' }}>
            <div style={{ display: 'flex' }}>
              {displayAvatars.map((url, idx) => (
                <img key={idx} src={url} alt="Attendee" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', marginLeft: idx > 0 ? '-10px' : '0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
              ))}
            </div>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
              <strong style={{ color: '#111827' }}>{attendeeCount}</strong> attending
            </span>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#10b981', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}> Be the first to register!</p>
        )}

        <div className="event-actions">
          {showRegister && (
            <button
              className={`register-button ${isRegistered ? "registered" : ""}`}
              onClick={handleRegisterClick}
              disabled={loading}
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
            >
              {isRegistered && isHoveringButton ? "Unregister" : isRegistered ? "Registered" : loading ? "Registering..." : "Register"}
            </button>
          )}
          <button className="share-button" onClick={(e) => { e.stopPropagation(); if (onShare) onShare(event); }}>Share Event</button>
        </div>
      </div>
    </div>
  );
}