import React, { useState } from "react";

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

  const mapSrc = event?.location
    ? `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
    : null;

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    return date.toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-body">
          {/* LEFT SIDE */}
          <div className="modal-info">
            <h2>{event.eventname}</h2>
            <div className="modal-info-spefs">
              <p>
                <strong>Start:</strong> {formatDate(event.starttime)}
              </p>
              <p>
                <strong>End:</strong> {formatDate(event.endtime)}
              </p>
              <p>
                <strong>Location:</strong> {event.location || "TBD"}
              </p>
            </div>
            <p className="event-desc">{event.eventdesc}</p>

            <div className="modal-actions">
              {onRegister && (
                <button
                  className={`button ${isRegistered ? "registered" : ""}`}
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
                      : "Register"}
                </button>
              )}

              <button
                className="share-button"
                onClick={() => onShare(event)}
              >
                Share Event
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="modal-map">
            {mapSrc && (
              <iframe
                src={mapSrc}
                style={{
                  border: 0,
                  borderRadius: "8px",
                }}
                loading="lazy"
                title="Event Location Map"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
};