import React, { useEffect, useState } from "react";
import { useEventContext } from "./EventContext"; // Adjust the path if needed!

export default function Settings() {
  // Grab our global dark mode state from Context!
  const { darkMode, setDarkMode } = useEventContext();

  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }
  }, []);

  const handleNotificationsChange = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("notifications", newValue);
  };

  return (
    <div style={{ display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      margin: "0",
     }}>
      <div style={{
        maxWidth: "600px",
        paddingRight: "400px",
        padding: "30px",
        backgroundColor: darkMode ? "#1e1e1e" : "#f9f9f9",
        color: darkMode ? "#ffffff" : "#000000",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ marginBottom: "10px" }}>Preferences</h1>
        <p style={{ marginBottom: "25px", color: darkMode ? "#aaa" : "#555" }}>
          Customize your experience.
        </p>

        {/* NOTIFICATIONS */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            Notification Preferences
          </label>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleNotificationsChange}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            Enable event notifications
          </div>
        </div>

        {/* DARK MODE */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Appearance</label>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            Enable Dark Mode
          </div>
        </div>

      </div>
    </div>
  );
}