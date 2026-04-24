import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createRegistration,
  deleteRegistration,
  getRegistration,
  getUserByFirebaseUid,
  findUserByEmail,
  listEvents,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";

const EventContext = createContext();

// =========================================================
// LOCAL STORAGE HELPERS
// =========================================================
const getStoredNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  } catch {
    return [];
  }
};

const saveStoredNotifications = (list) => {
  localStorage.setItem("notifications", JSON.stringify(list));
};

export function EventProvider({ children }) {
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [dbUserId, setDbUserId] = useState(null);

  // =========================================================
  // NOTIFICATIONS STATE
  // =========================================================
  const [notifications, setNotifications] = useState(getStoredNotifications);

  // =========================================================
  // ADD NOTIFICATION (always unread)
  // =========================================================
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      seen: false,
      ...notification,
      time: new Date().toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const stored = getStoredNotifications();
    const updated = [newNotification, ...stored];

    saveStoredNotifications(updated);

    // ONLY update UI history
    setNotifications(updated);

    // 🔥 NEW: emit toast event without affecting history
    window.dispatchEvent(
      new CustomEvent("toast", { detail: newNotification })
    );
  };

  // =========================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =========================================================
  const markNotificationRead = (id) => {
    const stored = getStoredNotifications();

    const updated = stored.map((n) =>
      n.id === id ? { ...n, seen: true } : n
    );

    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================
  const markAllNotificationsRead = () => {
    const stored = getStoredNotifications();

    const hasUnread = stored.some((n) => !n.seen);
    if (!hasUnread) return;

    const updated = stored.map((n) => ({
      ...n,
      seen: true,
    }));

    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  // =========================================================
  // CLEAR NOTIFICATIONS
  // =========================================================

  const clearNotifications = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  // =========================================================
  // USER RESOLUTION
  // =========================================================
  const resolveDbUserId = async (user) => {
    let dbUser = null;

    try {
      const uidResult = await getUserByFirebaseUid(getDataConnectClient(), {
        firebaseUid: user.uid,
      });
      dbUser = uidResult.data?.userLists?.[0];
    } catch { }

    if (!dbUser && user.email) {
      try {
        const emailResult = await findUserByEmail(getDataConnectClient(), {
          email: user.email.toLowerCase(),
        });
        dbUser = emailResult.data?.userLists?.[0];
      } catch { }
    }

    return dbUser?.id || null;
  };

  // =========================================================
  // LOAD REGISTRATIONS
  // =========================================================
  const loadRegistrations = async (userId) => {
    if (!userId) return;

    try {
      const { data } = await listEvents(getDataConnectClient());
      const events = data?.eventLists || [];

      const ids = new Set();

      for (const event of events) {
        try {
          const reg = await getRegistration(getDataConnectClient(), {
            eventId: event.id,
            userId,
          });

          if (reg.data?.registration) {
            ids.add(event.id);
          }
        } catch { }
      }

      setRegisteredEventIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // AUTH LISTENER
  // =========================================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user || user.isAnonymous) {
        setDbUserId(null);
        setRegisteredEventIds(new Set());
        return;
      }

      const id = await resolveDbUserId(user);
      if (!id) return;

      setDbUserId(id);
      loadRegistrations(id);
    });

    return () => unsubscribe();
  }, []);

  // =========================================================
  // REGISTER
  // =========================================================
  const registerForEvent = async (eventId, events = []) => {
    if (!dbUserId) return;

    await createRegistration(getDataConnectClient(), {
      eventId,
      userId: dbUserId,
      notif: true,
    });

    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });

    const event = events.find((e) => e.id === eventId);

    addNotification({
      type: "success",
      title: "Registered",
      message: `You registered for ${event?.eventname || "an event"}`,
    });
  };

  // =========================================================
  // UNREGISTER
  // =========================================================
  const unregisterFromEvent = async (eventId, events = []) => {
    if (!dbUserId) return;

    await deleteRegistration(getDataConnectClient(), {
      eventId,
      userId: dbUserId,
    });

    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });

    const event = events.find((e) => e.id === eventId);

    addNotification({
      type: "info",
      title: "Unregistered",
      message: `You left ${event?.eventname || "an event"}`,
    });
  };

  // =========================================================
  // PROVIDER
  // =========================================================
  return (
    <EventContext.Provider
      value={{
        registeredEventIds,
        notifications,

        addNotification,
        registerForEvent,
        unregisterFromEvent,

        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext);
}