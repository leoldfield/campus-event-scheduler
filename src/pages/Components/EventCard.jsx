import React from "react";

export default function EventCard({
  event,
  isRegistered,
  onRegister,
  onShare,
  onOpen,
  loading,
  showRegister = true,
}) {

const handleCardClick = () => {
    if (onOpen) onOpen(event);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer",
      }}
    >
      <h2>{event.eventname}</h2>

      <p>
        <strong>Start:</strong>{" "}
        {new Date(event.starttime).toLocaleString()}
      </p>
      <p>
        <strong>End:</strong>{" "}
        {new Date(event.endtime).toLocaleString()}
      </p>
      <p>
        <strong>Location:</strong> {event.location || "TBD"}
      </p>

      <p>{event.eventdesc}</p>

      <div className="regEventButton">
        {showRegister && (
          <button
            className={`button ${isRegistered ? "registered" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onRegister) onRegister(event.id);
            }}
            disabled={loading || isRegistered}
          >
            {isRegistered
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
            onShare(event);
          }}
        >
          Share Event
        </button>
      </div>
    </div>
  );
}