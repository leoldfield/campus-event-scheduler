import React, { useEffect, useMemo, useState } from "react";
import { listEvents } from "../dataconnect-generated";
import { getDataConnectClient } from "../firebase";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard.jsx";
import EventModal from "./Components/EventModal.jsx";
import "../css/MyEvents.css";

export default function MyEvents() {
  const { registeredEventIds, unregisterFromEvent } = useEventContext();

  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [unregisterLoading, setUnregisterLoading] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await listEvents(getDataConnectClient());
      setAllEvents(data?.eventLists || []);
      setLoading(false);
    };

    load();
  }, []);

  const registeredEvents = useMemo(() => {
    return allEvents.filter((e) =>
      registeredEventIds.has(e.id)
    );
  }, [allEvents, registeredEventIds]);

  const handleUnregister = async (eventId) => {
    setUnregisterLoading(eventId);

    try {
      await unregisterFromEvent(eventId);
      setSelectedEvent(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUnregisterLoading(null);
    }
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
    <div className="my-events-container">
      <h1>My Events</h1>

      {loading ? (
        <p>Loading...</p>
      ) : registeredEvents.length === 0 ? (
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
                onOpen={setSelectedEvent}
              />
            ))}
          </div>
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
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