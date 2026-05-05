import React, { useEffect, useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Sayfa açılınca kayıtlı ayarları getir
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.body.style.backgroundColor = "#121212";
    }

    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }
  }, []);

  // Dark mode toggle
  const handleDarkModeChange = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);

    if (newValue) {
      document.body.style.backgroundColor = "#121212";
    } else {
      document.body.style.backgroundColor = "white";
    }
  };

  // Save butonu
  const handleSave = () => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("notifications", notifications);
    alert("Preferences saved.");
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: darkMode ? "#1f1f1f" : "white",
        color: darkMode ? "white" : "black",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>Preferences</h1>
      <p style={{ marginBottom: "25px", color: darkMode ? "#ccc" : "#555" }}>
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
            onChange={handleDarkModeChange}
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