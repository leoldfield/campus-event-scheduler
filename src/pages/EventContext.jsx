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

export function EventProvider({ children }) {
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [dbUserId, setDbUserId] = useState(null);

  // 🔥 Resolve DB user (UUID) from Firebase user
  const resolveDbUserId = async (user) => {
    let dbUser = null;

    try {
      const uidResult = await getUserByFirebaseUid(getDataConnectClient(), {
        firebaseUid: user.uid,
      });
      dbUser = uidResult.data?.userLists?.[0];
    } catch {}

    if (!dbUser && user.email) {
      try {
        const emailResult = await findUserByEmail(getDataConnectClient(), {
          email: user.email.toLowerCase(),
        });
        dbUser = emailResult.data?.userLists?.[0];
      } catch {}
    }

    return dbUser?.id || null;
  };

  // 🔥 Load registrations once
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
        } catch {}
      }

      setRegisteredEventIds(ids);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    }
  };

  // 🔥 Auth init
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user || user.isAnonymous) {
        setDbUserId(null);
        setRegisteredEventIds(new Set());
        return;
      }

      const resolvedId = await resolveDbUserId(user);

      if (!resolvedId) return;

      setDbUserId(resolvedId);
      loadRegistrations(resolvedId);
    });

    return () => unsubscribe();
  }, []);

  // ✅ REGISTER
  const registerForEvent = async (eventId) => {
    if (!dbUserId) return;

    await createRegistration(getDataConnectClient(), {
      eventId,
      userId: dbUserId, // 🔥 UUID ONLY
      notif: false,
    });

    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });
  };

  // ✅ UNREGISTER
  const unregisterFromEvent = async (eventId) => {
    if (!dbUserId) return;

    await deleteRegistration(getDataConnectClient(), {
      eventId,
      userId: dbUserId, // 🔥 UUID ONLY
    });

    setRegisteredEventIds((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  };

  return (
    <EventContext.Provider
      value={{
        registeredEventIds,
        registerForEvent,
        unregisterFromEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext);
}