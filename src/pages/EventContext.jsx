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

const saveStoredNotifications = (list) => {
  try {
    localStorage.setItem("notifications", JSON.stringify(list));
  } catch (err) {
    console.warn("Local storage blocked or full. Running in memory mode only.");
  }
};

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

  const addNotification = (notif) => {
    const newNotif = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      seen: false,
      ...notif,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveStoredNotifications(updated);
      return updated;
    });

    // Also trigger the toast event
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: newNotif,
      })
    );
  };

  // ==========================================
  // REGISTER FOR EVENT (WITH GOOGLE CALENDAR)
  // ==========================================
  const registerForEvent = async (eventId, currentUser) => {
    if (!dbUserId) return;

    // Find the event to check its endtime
    const eventToRegister = events.find((e) => e.id === eventId);
    if (!eventToRegister) {
      console.error("Event not found for registration:", eventId);
      addNotification({ type: "error", title: "Error", message: "Event not found." });
      return;
    }

    const eventEndTime = new Date(eventToRegister.endtime);
    if (eventEndTime < new Date()) {
      addNotification({ type: "error", title: "Registration Failed", message: "This event has already ended." });
      return;
    }

    // 1. Save to Database
    await createRegistration(getDataConnectClient(), { eventId, userId: dbUserId, notif: true });

    // 2. Update Local UI State
    setRegisteredEventIds((prev) => new Set(prev).add(eventId));
    setAllRegistrations(prev => [...prev, { eventId, userId: dbUserId }]);

    // 3. Sync to Google Calendar
    try {
      const eventToSync = events.find((e) => e.id === eventId);
      if (currentUser && eventToSync) {
        await requestGoogleCalendarAccess(currentUser); // <-- ASKS FOR PERMISSION
      await createGoogleCalendarEvent(eventToSync, currentUser); // <-- ADDS TO CALENDAR
      }
    } catch (err) {
      console.error("Google Calendar sync failed:", err);
    }
  };

  // ==========================================
  // UNREGISTER FROM EVENT (WITH GOOGLE CALENDAR)
  // ==========================================
  const unregisterFromEvent = async (eventId, currentUser) => {
    if (!dbUserId) return;

    // 1. Remove from Database
    await deleteRegistration(getDataConnectClient(), { eventId, userId: dbUserId });

    // Find the event to pass to Google Calendar deletion
    const eventToUnsync = events.find((e) => e.id === eventId);
    if (!eventToUnsync) {
      console.error("Event not found for unregistration:", eventId);
    }
    // 2. Update Local UI State
    setRegisteredEventIds((prev) => { const next = new Set(prev); next.delete(eventId); return next; });
    setAllRegistrations(prev => prev.filter(reg => !(reg.eventId === eventId && reg.userId === dbUserId)));

    // 3. Remove from Google Calendar
    try {
      if (currentUser && eventToUnsync) { // Ensure eventToUnsync is found before attempting Google Calendar deletion
        await requestGoogleCalendarAccess(currentUser); // <-- ASKS FOR PERMISSION
        await deleteGoogleCalendarEvent(eventToUnsync, currentUser); // <-- REMOVES FROM CALENDAR
      }
    } catch (err) {
      console.error("Google Calendar removal failed:", err);
    }
  };

  // === SECURE DELETE EVENT LOGIC ===
  const handleDeleteEvent = async (eventId, eventCreatorId) => {
    if (!dbUserId) {
      console.error("Cannot delete event: User not logged in.");
      addNotification({ type: "error", title: "Error", message: "You must be logged in to delete events." });
      return;
    }
    if (dbUserId !== eventCreatorId) {
      console.error("Cannot delete event: User is not the event coordinator.");
      addNotification({ type: "error", title: "Error", message: "You can only delete events you created." });
      return;
    }
    try {
      await deleteSecureEvent(getDataConnectClient(), { id: eventId, eventcoord: dbUserId });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      addNotification({
        type: "deletion",
        title: "Event Deleted",
        message: "Your event was successfully removed."
      });
    } catch (err) {
      console.error("Failed to delete event:", err);
      addNotification({ type: "error", title: "Error", message: "Could not delete event." });
    }
  };

  // ==========================================
  // NOTIFICATION FUNCTIONS
  // ==========================================
  const markNotificationRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, seen: true } : n
      );
      saveStoredNotifications(updated);
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, seen: true }));
      saveStoredNotifications(updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  // ==========================================
  // LOCAL EVENT OPTIMISTIC UPDATE (FOR THE MAP)
  // ==========================================
  const addEventLocal = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  // ==========================================
  // EVENT REMINDERS (1 Hour, 1 Day, 3 Days)
  // ==========================================
  useEffect(() => {
    if (events.length === 0 || registeredEventIds.size === 0) return;

    const checkReminders = () => {
      // Load history so we don't spam the user with the same reminder
      let triggeredReminders = {};
      try {
        triggeredReminders = JSON.parse(localStorage.getItem("triggeredReminders")) || {};
      } catch {
        triggeredReminders = {};
      }
      let updated = false;
      const now = new Date().getTime();

      events.forEach((event) => {
        if (registeredEventIds.has(event.id)) {
          const eventTime = new Date(event.starttime).getTime();
          const diffHours = (eventTime - now) / (1000 * 60 * 60);

          // Skip events that have already started
          if (diffHours < 0) return;

          // 3 Days (Between 48 and 72 hours away)
          if (diffHours <= 72 && diffHours > 48 && !triggeredReminders[`${event.id}_72hr`]) {
            addNotification({ type: "reminder", title: "Event in 3 Days!", message: `Get ready! ${event.eventname} is coming up.` });
            triggeredReminders[`${event.id}_72hr`] = true;
            updated = true;
          }
          // 1 Day (Between 1 and 24 hours away)
          else if (diffHours <= 24 && diffHours > 1 && !triggeredReminders[`${event.id}_24hr`]) {
            addNotification({ type: "reminder", title: "Event Tomorrow!", message: `${event.eventname} is happening tomorrow.` });
            triggeredReminders[`${event.id}_24hr`] = true;
            updated = true;
          }
          // 1 Hour (Between 0 and 1 hour away)
          else if (diffHours <= 1 && diffHours > 0 && !triggeredReminders[`${event.id}_1hr`]) {
            addNotification({ type: "reminder", title: "Starting Soon!", message: `${event.eventname} starts in less than an hour!` });
            triggeredReminders[`${event.id}_1hr`] = true;
            updated = true;
          }
        }
      });

      // If we fired a new reminder, save it to storage
      if (updated) {
        try {
          localStorage.setItem("triggeredReminders", JSON.stringify(triggeredReminders));
        } catch (err) {
          console.warn("Could not save reminder history.");
        }
      }
    };

    checkReminders(); // Run once immediately on load
    const interval = setInterval(checkReminders, 60000); // Then check the clock every 60 seconds

    return () => clearInterval(interval);
  }, [events, registeredEventIds]);

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