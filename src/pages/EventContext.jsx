import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createRegistration,
  deleteRegistration,
  listAllRegistrations,
  listSafeUsers,
  deleteSecureEvent,
  getUserByFirebaseUid,
  findUserByEmail,
  listEvents,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  requestGoogleCalendarAccess,
} from "../googleCalendar";

const EventContext = createContext();

const getStoredNotifications = () => {
  try { return JSON.parse(localStorage.getItem("notifications")) || []; } catch { return []; }
};
const saveStoredNotifications = (list) => { localStorage.setItem("notifications", JSON.stringify(list)); };

export function EventProvider({ children }) {
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [dbUserId, setDbUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [notifications, setNotifications] = useState(getStoredNotifications);

  const [allRegistrations, setAllRegistrations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // LOAD EVENTS
  const refreshEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setEventsError("");
      const { data } = await listEvents(getDataConnectClient(), { fetchPolicy: "network-only" });
      setEvents([...data?.eventLists || []]);
    } catch (err) {
      setEventsError(err?.message || "Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  // ==========================================
  // SECURE DATA LOADING (Only runs for Logged-In Users!)
  // ==========================================
  const loadSecurePlatformData = useCallback(async () => {
    try {
      const [usersRes, regsRes] = await Promise.all([
        listSafeUsers(getDataConnectClient()),
        listAllRegistrations(getDataConnectClient())
      ]);

      const users = usersRes.data?.userLists || [];
      const regs = regsRes.data?.registrations || [];

      setAllUsers(users);
      setAllRegistrations(regs);

      // Return the data directly so the auth loop can use it immediately!
      return { users, regs };
    } catch (err) {
      console.error("Failed to load secure platform data", err);
      return { users: [], regs: [] };
    }
  }, []);

  // Initial load for EVERYONE (Just the public events!)
  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // IF GUEST OR LOGGED OUT: Wipe all private data to prevent leaks!
      if (!user || user.isAnonymous) {
        setDbUserId(null);
        setRegisteredEventIds(new Set());
        setAllUsers([]);
        setAllRegistrations([]);
        return;
      }

      // IF LOGGED IN: Safely fetch the names and registrations, and grab the fresh data
      const { regs } = await loadSecurePlatformData();

      // Resolve DB User ID
      let id = null;
      try {
        const uidResult = await getUserByFirebaseUid(getDataConnectClient(), { firebaseUid: user.uid });
        id = uidResult.data?.userLists?.[0]?.id;
      } catch { }
      if (!id && user.email) {
        try {
          const emailResult = await findUserByEmail(getDataConnectClient(), { email: user.email.toLowerCase() });
          id = emailResult.data?.userLists?.[0]?.id;
        } catch { }
      }

      if (id) {
        setDbUserId(id);
        // Map over the fresh 'regs' variable we just fetched, NOT the React state!
        setRegisteredEventIds(prev => {
          const myRegs = regs.filter(reg => reg.userId === id).map(reg => reg.eventId);
          return new Set([...prev, ...myRegs]);
        });
      }
    });

    // THE FIX: We removed `allRegistrations` from this array so it never loops!
    return () => unsubscribe();
  }, [loadSecurePlatformData]);

  const addNotification = (notification) => {
    const newNotification = { id: Date.now(), seen: false, ...notification, time: new Date().toLocaleString() };
    const updated = [newNotification, ...getStoredNotifications()];
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const registerForEvent = async (eventId, currentUser) => {
    if (!dbUserId) return;
    await createRegistration(getDataConnectClient(), { eventId, userId: dbUserId, notif: true });
    setRegisteredEventIds((prev) => new Set(prev).add(eventId));
    setAllRegistrations(prev => [...prev, { eventId, userId: dbUserId }]); // Optimistic update
    addNotification({ type: "success", title: "Registered", message: "You registered for an event!" });
  };

  const unregisterFromEvent = async (eventId, currentUser) => {
    if (!dbUserId) return;
    await deleteRegistration(getDataConnectClient(), { eventId, userId: dbUserId });
    setRegisteredEventIds((prev) => { const next = new Set(prev); next.delete(eventId); return next; });
    setAllRegistrations(prev => prev.filter(reg => !(reg.eventId === eventId && reg.userId === dbUserId)));
    addNotification({ type: "info", title: "Unregistered", message: "You left an event." });
  };

  // === SECURE DELETE EVENT LOGIC ===
  const handleDeleteEvent = async (eventId, eventcoord) => {
    try {
      await deleteSecureEvent(getDataConnectClient(), { id: eventId, eventcoord: eventcoord });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      addNotification({ type: "success", title: "Deleted", message: "Event successfully deleted." });
    } catch (err) {
      console.error("Failed to delete event:", err);
      addNotification({ type: "error", title: "Error", message: "Could not delete event." });
    }
  };

  // ==========================================
  // NOTIFICATION FUNCTIONS
  // ==========================================
  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, seen: true } : n);
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, seen: true }));
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const clearNotifications = () => {
    saveStoredNotifications([]);
    setNotifications([]);
  };

  // ==========================================
  // LOCAL EVENT OPTIMISTIC UPDATE (FOR THE MAP)
  // ==========================================
  const addEventLocal = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <EventContext.Provider value={{
      registeredEventIds, allRegistrations, allUsers, notifications, addNotification,
      registerForEvent, unregisterFromEvent, dbUserId, events, setEvents,
      loadingEvents, eventsError, refreshEvents, handleDeleteEvent,
      markNotificationRead, markAllNotificationsRead, clearNotifications,
      addEventLocal
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() { return useContext(EventContext); }