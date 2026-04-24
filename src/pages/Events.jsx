import React, { useEffect, useMemo, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { listEvents } from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/Events.css";
import "../css/EventModal.css";

import {
  getUserByFirebaseUid,
  findUserByEmail,
} from "../dataconnect-generated";

export default function Events() {
  const { registeredEventIds, registerForEvent } = useEventContext();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentUser, setCurrentUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState("");

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // =========================
  // Load events
  // =========================
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await listEvents(getDataConnectClient());
        setEvents(data?.eventLists || []);
      } catch {
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

  // =========================
  // Auth user name
  // =========================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);

      if (!user || user.isAnonymous) {
        setFirstName("");
        setLoadingName(false);
        return;
      }

      setLoadingName(true);

      const loadUser = async () => {
        try {
          let matchedUser = null;

          try {
            const uidResult = await getUserByFirebaseUid(getDataConnectClient(), {
              firebaseUid: user.uid,
            });
            matchedUser = uidResult.data?.userLists?.[0];
          } catch {}

          if (!matchedUser && user.email) {
            const emailResult = await findUserByEmail(getDataConnectClient(), {
              email: user.email.toLowerCase(),
            });
            matchedUser = emailResult.data?.userLists?.[0];
          }

          setFirstName(matchedUser?.firstname || user.displayName || "");
          setNameError("");
        } catch (err) {
          setNameError(err.message);
          setFirstName(user.displayName || "");
        } finally {
          setLoadingName(false);
        }
      };

      loadUser();
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // Register
  // =========================
  const handleRegister = async (eventId) => {
    setRegisterLoadingId(eventId);
    setRegisterError("");
    setRegisterMessage("");

    if (!isSignedInUser) {
      setRegisterError("Please log in to register for events.");
      setRegisterLoadingId(null);
      return;
    }

    try {
      await registerForEvent(eventId, events);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
      setRegisterMessage("Registered!");
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoadingId(null);
    }
  };

  // =========================
  // Share
  // =========================
  const handleShare = async (event) => {
    const url = `${window.location.origin}/event/${event.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.eventname,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  // =========================
  // Filters
  // =========================
  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map((e) => e.location).filter(Boolean))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      if (registeredEventIds.has(event.id)) return false;

      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !query ||
        event.eventname.toLowerCase().includes(query) ||
        event.eventdesc.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      const matchesLocation =
        selectedLocation === "all" || event.location === selectedLocation;

      const eventStart = new Date(event.starttime);

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "upcoming" && eventStart >= now) ||
        (selectedStatus === "past" && eventStart < now);

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [events, searchTerm, selectedLocation, selectedStatus, registeredEventIds]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedStatus("all");
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>UA Little Rock Campus Events</h1>

      {isSignedInUser && (
        <h2>
          Welcome{loadingName ? "..." : ""}{""}
          {!loadingName && firstName ? `, ${firstName}` : ""}!
        </h2>
      )}

      <p>Find upcoming University of Arkansas at Little Rock events and register easily.</p>

      {loadingEvents && <p>Loading events...</p>}
      {eventsError && <p style={{ color: "red" }}>{eventsError}</p>}
      {registerError && <p style={{ color: "red" }}>{registerError}</p>}
      {registerMessage && <p style={{ color: "green" }}>{registerMessage}</p>}
      {nameError && !firstName && <p>Could not load user name.</p>}

      {/* FILTERS */}
      <div className="ua-filter-bar">
        <input
          className="ua-filter-input"
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="ua-filter-select"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="all">All locations</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          className="ua-filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All events</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

        <button className="ua-filter-clear" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* EVENTS GRID */}
      <div className="events-grid">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={false}
            loading={registerLoadingId === event.id}
            onRegister={handleRegister}
            onShare={handleShare}
            onOpen={setSelectedEvent}
          />
        ))}
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
        isRegistered={false}
        onShare={handleShare}
        loading={registerLoadingId === selectedEvent?.id}
      />
    </div>
  );
}