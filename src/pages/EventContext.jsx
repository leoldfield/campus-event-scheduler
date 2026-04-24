import React, { createContext, useContext, useState, useEffect } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      time: new Date().toLocaleString()
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <EventContext.Provider value={{ registeredEventIds, setRegisteredEventIds, notifications, addNotification }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext);
}