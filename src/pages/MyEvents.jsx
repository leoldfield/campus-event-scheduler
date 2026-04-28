import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/MyEvents.css";

import { deleteGoogleCalendarEvent } from "../googleCalendar";
import { auth } from "../firebase";

export default function MyEvents() {
  const navigate = useNavigate();

  const {
    events,
    registeredEventIds,
    unregisterFromEvent,
  } = useEventContext();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [unregisterLoading, setUnregisterLoading] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // keep minimal auth only for Google Calendar cleanup
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // =========================
  // Derived state (NO local fetch)
  // =========================
  const registeredEvents = useMemo(() => {
    return events.filter((e) => registeredEventIds.has(e.id));
  }, [events, registeredEventIds]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // =========================
  // Unregister
  // =========================
  const handleUnregister = async (eventId) => {
    setUnregisterLoading(eventId);

    try {
      const event = events.find((e) => e.id === eventId);

      // 1. DB unregister (context handles this)
      await unregisterFromEvent(eventId);

      // 2. Calendar cleanup (optional side effect)
      if (event && currentUser?.email) {
        try {
          await deleteGoogleCalendarEvent(event, currentUser);
        } catch (err) {
          console.warn("Calendar deletion failed:", err);
          alert(
            "Unregistered successfully, but Google Calendar could not be updated."
          );
        }
      }

      setSelectedEventId(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUnregisterLoading(null);
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
  // Edit
  // =========================
  const handleEdit = (event) => {
    navigate("/create", { state: { event } });
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="my-events-container">
      <h1>My Events</h1>

      {events.length === 0 ? (
        <p>No registered events.</p>
      ) : (
        <>
          <div className="events-grid">
            {registeredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={true}
                loading={unregisterLoading === event.id}
                onRegister={handleUnregister}
                onShare={handleShare}
                onOpen={(event) => setSelectedEventId(event.id)}
                showEdit={true}
                onEdit={handleEdit}
              />
            ))}
          </div>

          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEventId(null)}
            onRegister={handleUnregister}
            isRegistered={true}
            onShare={handleShare}
            loading={unregisterLoading === selectedEvent?.id}
          />
        </>
      )}
    </div>
  );
}