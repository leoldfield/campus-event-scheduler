import React from "react";
import { useEventContext } from "./EventContext";
import "../css/Notification.css";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaBell,
  FaRegTrashAlt,
} from "react-icons/fa";

const Notification = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useEventContext();

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle color="green" />;
      case "info":
        return <FaInfoCircle color="#2b6cb0" />;
      case "reminder":
        return <FaBell color="#d97706" />;
        case "deletion":
          return <FaRegTrashAlt color="grey" />;
      default:
        return <FaInfoCircle color="#666" />;
    }
  };

  const unread = notifications.filter((n) => !n.seen);
  const read = notifications.filter((n) => n.seen);

  const renderList = (items, isUnread = false) => (
    <div className="notifications-list">
      {items.map((n) => (
        <div key={n.id} className={`notification-card ${n.type || ""}`}>

          <div className="notification-left">
            <div className="notification-icon">
              {getIcon(n.type)}
            </div>
          </div>

          <div className="notification-content">
            <h3>{n.title}</h3>
            <p>{n.message}</p>

            {isUnread && (
              <button
                onClick={() => markNotificationRead(n.id)}
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  background: "none",
                  border: "none",
                  color: "#8b0000",
                  cursor: "pointer",
                }}
              >
                Mark as read
              </button>
            )}
          </div>

          <div className="notification-time">
            {n.time}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>

      <div className="notification-actions">

        {notifications.length > 0 && (
          <button className="notif-btn read"
            onClick={markAllNotificationsRead}
            style={{
              marginBottom: "15px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Mark all as read
          </button>

        )}

        {notifications.length > 0 && (
          <button className="notif-btn-clear"
            onClick={clearNotifications}
            style={{
              marginBottom: "15px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Clear Notifications
          </button>

        )}
      </div>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <>
          {unread.length > 0 && (
            <>
              <h3>Unread</h3>
              {renderList(unread, true)}
            </>
          )}

          {read.length > 0 && (
            <>
              <h3>Read</h3>
              {renderList(read, false)}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Notification;