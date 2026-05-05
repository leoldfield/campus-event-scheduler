import React, { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    alert("Preferences saved.");
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>Preferences</h1>
      <p style={{ marginBottom: "25px", color: "#555" }}>
        Customize your experience.
      </p>

      {/* NOTIFICATIONS */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>
          Notification Preferences
        </label>

        <div style={{ marginTop: "10px" }}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />{" "}
          Enable event notifications
        </div>
      </div>

      {/* DARK MODE */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>Dark Mode</label>

        <div style={{ marginTop: "10px" }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />{" "}
          Enable dark mode
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#7a1f3d",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Save Preferences
      </button>
    </div>
  );
}

export default Settings;