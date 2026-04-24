import React, { useEffect, useMemo, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { listEvents } from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/Events.css";
import "../css/EventModal.css";

export default function Events() {
  const { registeredEventIds, registerForEvent } = useEventContext();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedEvent, setSelectedEvent] = useState(null);

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
          setRegisterError(err.message);
        }
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const handleRegister = async (eventId) => {
    setRegisterLoadingId(eventId);

    try {
      await registerForEvent(eventId);

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
      setRegisterMessage("Registered!");
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoadingId(null);
    }
  };

  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map(e => e.location).filter(Boolean))];
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

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>UA Little Rock Campus Events</h1>

      {loadingEvents && <p>Loading...</p>}
      {registerError && <p style={{ color: "red" }}>{registerError}</p>}
      {registerMessage && <p style={{ color: "green" }}>{registerMessage}</p>}

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
            <option key={loc}>{loc}</option>
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