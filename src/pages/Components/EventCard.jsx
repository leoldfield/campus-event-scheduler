import React, { useState } from "react";
import "../../css/Events.css";
import "../../assets/edit-pencil.png";
import "../../assets/test-image-600x300.png";

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

  const handleCardClick = () => {
    if (onOpen) onOpen(event);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="event-card" onClick={handleCardClick}>
      {/* IMAGE */}
      <div className="event-card-image">
        <img
          src={event.image || "/src/assets/test-image-600x300.png"}
          alt={event.eventname}
        />
      </div>

      {/* CONTENT */}
      <div className="event-card-content">
        {/* DATE + EDIT */}
        <div className="event-card-date-row">
          <div className="event-card-date">
            <span className="pill">{formatDate(event.starttime)}</span>
            <span className="pill">{formatTime(event.starttime)}</span>
          </div>

          {showEdit && (
            <button
              className="edit-icon-button"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(event);
              }}
              title="Edit Event"
            >
              <img
                src="/src/assets/edit-pencil.png"
                alt="Edit"
                className="edit-pencil"
                height="25"
                width="25"
              />
            </button>
          )}
        </div>

        {/* TAGLINE */}
        <p className="event-tagline">EVENT</p>

        {/* TITLE */}
        <h2 className="event-title">{event.eventname}</h2>

        {/* DESCRIPTION */}
        <p className="event-desc">{event.eventdesc}</p>
        
        {/* ACTIONS */}
        <div className="event-actions">
          {showRegister && (
            <button
                  className={`register-button ${isRegistered ? "registered" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRegister) onRegister(event.id);
                  }}
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
                      : "Register"}
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
    </div>
  );
}