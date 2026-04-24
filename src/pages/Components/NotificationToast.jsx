import React, { useEffect, useState } from "react";
import "../../css/NotificationToast.css";

export default function NotificationToast() {
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setVisible(e.detail);

      const timer = setTimeout(() => {
        setVisible(null);
      }, 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${visible.type || "info"}`}>
        <button className="toast-close" onClick={() => setVisible(null)}>
          ×
        </button>

        <div className="toast-title">{visible.title}</div>
        <div className="toast-message">{visible.message}</div>
      </div>
    </div>
  );
}