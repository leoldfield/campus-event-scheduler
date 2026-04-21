import React, { useEffect, useMemo, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import {
  createRegistration,
  deleteRegistration,
  findUserByEmail,
  getRegistration,
  getUserByFirebaseUid,
  listEvents,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/Events.css";
import "../css/EventModal.css";

export default function Events() {
  const { registeredEventIds, setRegisteredEventIds } = useEventContext();

  const [currentUser, setCurrentUser] = useState(null);
  const [dbUserId, setDbUserId] = useState("");

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEventStatus, setSelectedEventStatus] = useState("all");

  const [selectedEvent, setSelectedEvent] = useState(null);

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);

  // ✅ Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setRegisteredEventIds(new Set());
    });

    return () => unsubscribe();
  }, []);

  // ✅ Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await listEvents(getDataConnectClient());
        setEvents(data?.eventLists || []);
      } catch (error) {
        try {
          await signInAnonymously(auth);
          const { data } = await listEvents(getDataConnectClient());
          setEvents(data?.eventLists || []);
        } catch (err) {
          setEventsError(err.message);
        }
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // ✅ Load user + registrations
  useEffect(() => {
    const loadUserData = async () => {
      if (!isSignedInUser || !currentUser) return;

      let dbUser = null;

      try {
        const userResult = await getUserByFirebaseUid(getDataConnectClient(), {
          firebaseUid: currentUser.uid,
        });
        dbUser = userResult.data?.userLists?.[0];
      } catch {}

      if (!dbUser && currentUser.email) {
        const emailResult = await findUserByEmail(getDataConnectClient(), {
          email: currentUser.email.toLowerCase(),
        });
        dbUser = emailResult.data?.userLists?.[0];
      }

      if (!dbUser?.id) return;

      setDbUserId(dbUser.id);

      const registeredIds = new Set();

      for (const event of events) {
        try {
          const reg = await getRegistration(getDataConnectClient(), {
            eventId: event.id,
            userId: dbUser.id,
          });

          if (reg.data?.registration) {
            registeredIds.add(event.id);
          }
        } catch {}
      }

      setRegisteredEventIds(registeredIds);
    };

    loadUserData();
  }, [currentUser, events]);

  // ✅ Register
  const handleRegister = async (eventId) => {
    if (!dbUserId) return;

    setRegisterLoadingId(eventId);

    try {
      await createRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUserId,
        notif: false,
      });

      setRegisteredEventIds((prev) => new Set(prev).add(eventId));
      setRegisterMessage("Registered!");
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoadingId(null);
    }
  };

  // ✅ Unregister
  const handleUnregister = async (eventId) => {
    if (!dbUserId) return;

    setRegisterLoadingId(eventId);

    try {
      await deleteRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUserId,
      });

      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.delete(eventId);
        return updated;
      });

      setRegisterMessage("Unregistered.");
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoadingId(null);
    }
  };

  // ✅ Share
  const handleShare = async (event) => {
    const url = `${window.location.origin}/event/${event.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.eventname, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch {}
  };

  // ✅ Filters
  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map(e => e.location).filter(Boolean))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const eventStart = new Date(event.starttime);

      return (
        (!searchTerm ||
          event.eventname.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedLocation === "all" || event.location === selectedLocation) &&
        (selectedStatus === "all" ||
          (selectedStatus === "upcoming" && eventStart >= now) ||
          (selectedStatus === "past" && eventStart < now)) &&
        (selectedEventStatus === "all" ||
          (selectedEventStatus === "ongoing" && event.eventstatus) ||
          (selectedEventStatus === "cancelled" && !event.eventstatus))
      );
    });
  }, [events, searchTerm, selectedLocation, selectedStatus, selectedEventStatus]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>UA Little Rock Campus Events</h1>

      {loadingEvents && <p>Loading...</p>}
      {eventsError && <p style={{ color: "red" }}>{eventsError}</p>}

      {filteredEvents.map((event) => {
        const isRegistered = registeredEventIds.has(event.id);
        const isBusy = registerLoadingId === event.id;

        return (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={isRegistered}
            loading={isBusy}
            onRegister={isRegistered ? handleUnregister : handleRegister}
            onShare={handleShare}
            onOpen={setSelectedEvent}
          />
        );
      })}

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        onShare={handleShare}
        isRegistered={selectedEvent && registeredEventIds.has(selectedEvent.id)}
        loading={registerLoadingId === selectedEvent?.id}
      />
    </div>
  );
}