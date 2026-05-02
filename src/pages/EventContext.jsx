import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createRegistration,
  deleteRegistration,
  getRegistration,
  listRegistrations, 
  getUserByFirebaseUid,
  findUserByEmail,
  listEvents,
  listUsers, // <-- NEW: Imported to fetch user names for avatars!
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  requestGoogleCalendarAccess,
} from "../googleCalendar";

const EventContext = createContext();

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
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [notifications, setNotifications] = useState(getStoredNotifications);

  // === NEW STATES FOR SOCIAL PROOF ===
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const refreshEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setEventsError("");
      const client = getDataConnectClient();
      const { data } = await listEvents(client, { fetchPolicy: "network-only" });
      setEvents([...data?.eventLists || []]);
    } catch (err) {
      console.error("Failed to refresh events", err);
      setEventsError(err?.message || "Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      seen: false,
      ...notification,
      time: new Date().toLocaleString([], {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    };
    const stored = getStoredNotifications();
    const updated = [newNotification, ...stored];
    saveStoredNotifications(updated);
    setNotifications(updated);
    window.dispatchEvent(new CustomEvent("toast", { detail: newNotification }));
  };

  const markNotificationRead = (id) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, seen: true } : n);
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, seen: true }));
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const clearNotifications = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  useEffect(() => {
    if (!dbUserId || events.length === 0 || registeredEventIds.size === 0) return;
    const reminded = new Set(JSON.parse(localStorage.getItem("remindedEvents") || "[]"));
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    registeredEventIds.forEach((eventId) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;
      const start = new Date(event.starttime);
      if (Number.isNaN(start.getTime())) return;

      if (start >= now && start <= soon && !reminded.has(eventId)) {
        addNotification({
          type: "reminder", title: "Event Reminder",
          message: `${event.eventname} starts within 24 hours`,
        });
        reminded.add(eventId);
      }
    });
    localStorage.setItem("remindedEvents", JSON.stringify([...reminded]));
  }, [events, registeredEventIds, dbUserId]);

  const resolveDbUserId = async (user) => {
    let dbUser = null;
    try {
      const uidResult = await getUserByFirebaseUid(getDataConnectClient(), { firebaseUid: user.uid });
      dbUser = uidResult.data?.userLists?.[0];
    } catch { }

    if (!dbUser && user.email) {
      try {
        const emailResult = await findUserByEmail(getDataConnectClient(), { email: user.email.toLowerCase() });
        dbUser = emailResult.data?.userLists?.[0];
      } catch { }
    }
    return dbUser?.id || null;
  };

  const loadRegistrations = async (userId) => {
    if (!userId) return;
    try {
      // 1. Fetch all registrations for Social Proof
      const { data } = await listRegistrations(getDataConnectClient());
      const regs = data?.registrations || [];
      setAllRegistrations(regs);

      const userRegisteredEventIds = new Set(
        regs.filter(reg => reg.userId === userId).map(reg => reg.eventId)
      );
      setRegisteredEventIds(userRegisteredEventIds);

      // 2. Fetch all users to map names to Avatars
      const { data: userData } = await listUsers(getDataConnectClient());
      setAllUsers(userData?.userLists || []);
      
    } catch (err) {
      console.error("Failed to load registrations or users", err);
    }
  };

  const updateEventLocal = (updatedEvent) => {
    setEvents((prev) => prev.map((e) => e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e));
  };

  const addEventLocal = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };
  
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

      await Promise.all([
        loadRegistrations(id),
        refreshEvents(),
      ]);
    });
    return () => unsubscribe();
  }, []);

  const registerForEvent = async (eventId, currentUser) => {
    if (!dbUserId) return;
    await createRegistration(getDataConnectClient(), { eventId, userId: dbUserId, notif: true });
    setRegisteredEventIds((prev) => new Set(prev).add(eventId));
    
    // Optimistically update global social proof immediately!
    setAllRegistrations(prev => [...prev, { eventId, userId: dbUserId }]);

    const event = events.find((e) => e.id === eventId);
    if (event && currentUser?.email) {
      try { await createGoogleCalendarEvent(event, currentUser); } catch (err) { console.warn(err); }
    }
    addNotification({ type: "success", title: "Registered", message: `You registered for ${event?.eventname || "an event"}` });
  };

  const unregisterFromEvent = async (eventId, currentUser) => {
    if (!dbUserId) return;
    await deleteRegistration(getDataConnectClient(), { eventId, userId: dbUserId });
    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });

    // Optimistically update global social proof
    setAllRegistrations(prev => prev.filter(reg => !(reg.eventId === eventId && reg.userId === dbUserId)));

    const event = events.find((e) => e.id === eventId);
    if (event && currentUser?.email) {
      try {
        await deleteGoogleCalendarEvent(event, currentUser, { prompt: "none" });
      } catch (err) {
        if (err.message?.includes("interaction_required")) {
          await requestGoogleCalendarAccess();
          await deleteGoogleCalendarEvent(event, currentUser).catch(e => console.error(e));
        }
      }
    }
    addNotification({ type: "info", title: "Unregistered", message: `You left ${event?.eventname || "an event"}` });
  };

  return (
    <EventContext.Provider
      value={{
        registeredEventIds, setRegisteredEventIds,
        allRegistrations, allUsers, // <-- EXPOSED TO APP
        notifications, addNotification,
        registerForEvent, unregisterFromEvent,
        markNotificationRead, markAllNotificationsRead, clearNotifications,
        dbUserId, events, setEvents,
        loadingEvents, eventsError, refreshEvents, updateEventLocal, addEventLocal,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext);
}