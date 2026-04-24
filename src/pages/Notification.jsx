import React from "react";
import "../css/Notification.css";
import { useEventContext } from "./EventContext";

const Notification = () => {
  const { notifications } = useEventContext();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentNotifications = notifications.filter(notif => {
    const notifDate = new Date(notif.time);
    return notifDate >= oneWeekAgo;
  });

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>

      <div className="notifications-list">
        {recentNotifications.length === 0 ? (
          <p>No notifications in the past week.</p>
        ) : (
          recentNotifications.map((notif) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;