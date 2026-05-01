import React, { useState } from "react";
import testimage from "../../assets/UALR-banner.jpg";

// Category definitions to match your gorgeous new Event Cards
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

  if (!event) return null;

  // Grab the matching category color/icon, or fallback to a default
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* HERO BANNER */}
        <div className="modal-banner">
          <img
            src={event.imageUrl || testimage}
            alt={event.eventname || "Event Banner"}
            className="event-card-img"
          />
        </div>

        <div className="modal-body">
          {/* LEFT SIDE: Info & Actions */}
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

            <div className="modal-description-section">
              <h3>About this Event</h3>
              <p className="event-desc">{event.eventdesc}</p>
            </div>

            <div className="modal-actions">
              {onRegister && (
                <button
                  className={`modal-btn register-btn ${isRegistered ? "registered" : ""}`}
                  onClick={() => onRegister(event.id)}
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

              <button
            className="share-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onShare) onShare(event);
            }}
          >
            Share Event
          </button>
            </div>
          </div>

          {/* RIGHT SIDE: Map */}
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