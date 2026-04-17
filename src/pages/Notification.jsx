import React from "react";
import "../css/Notification.css";

const Notification = () => {
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Registration Confirmed",
      message: "You have successfully registered for Hackathon 2026.",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "error",
      title: "Event Cancelled",
      message: "The Music Festival event has been cancelled.",
      time: "5 hours ago"
    },
    {
      id: 3,
      type: "reminder",
      title: "Event Reminder",
      message: "Reminder: Tech Talk starts tomorrow at 3:00 PM.",
      time: "1 day ago"
    },
    {
      id: 4,
      type: "success",
      title: "Registration Confirmed",
      message: "You have successfully registered for Coding Workshop.",
      time: "2 days ago"
    }
  ];

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>

      <div className="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification-card ${notif.type}`}>
            
            <div className="notification-left">
              {/* Placeholder icon (you can replace later) */}
              <div className="notification-icon"></div>
            </div>

            <div className="notification-content">
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
            </div>

            <div className="notification-time">
              {notif.time}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;