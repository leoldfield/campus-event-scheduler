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
      } catch { }

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
        } catch { }
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
    } catch { }
  };

  // ✅ Filters
  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map(e => e.location).filter(Boolean))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const name = (event.eventname || "").toLowerCase();
      const desc = (event.eventdesc || "").toLowerCase();
      const location = (event.location || "").toLowerCase();
      const query = searchTerm.trim().toLowerCase();

      const eventStart = new Date(event.starttime);
      const isValidDate = !Number.isNaN(eventStart.getTime());

      const matchesSearch =
        !query ||
        name.includes(query) ||
        desc.includes(query) ||
        location.includes(query);

      const matchesLocation =
        selectedLocation === "all" || (event.location || "") === selectedLocation;

      let matchesStatus = true;
      if (selectedStatus === "upcoming") {
        matchesStatus = isValidDate ? eventStart >= now : false;
      } else if (selectedStatus === "past") {
        matchesStatus = isValidDate ? eventStart < now : false;
      }

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [events, searchTerm, selectedLocation, selectedStatus]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedEventStatus("all");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>UA Little Rock Campus Events</h1>

      {loadingEvents && <p>Loading...</p>}
      {eventsError && <p style={{ color: "red" }}>{eventsError}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <label htmlFor="event-search" style={{ display: "block", marginBottom: "6px" }}>
            Search events
          </label>
          <input
            id="event-search"
            type="text"
            placeholder="Search by name, description, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <label htmlFor="location-filter" style={{ display: "block", marginBottom: "6px" }}>
            Filter by location
          </label>
          <select
            id="location-filter"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <option value="all">All locations</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 0 }}>
          <label htmlFor="status-filter" style={{ display: "block", marginBottom: "6px" }}>
            Filter by status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <option value="all">All events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "end", minWidth: 0 }}>
          <button
            onClick={clearFilters}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {!loadingEvents && !eventsError && filteredEvents.length === 0 && events.length > 0 ? (
        <p>No events match your current search or filters.</p>
      ) : null}

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