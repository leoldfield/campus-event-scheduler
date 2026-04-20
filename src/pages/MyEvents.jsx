import React, { useEffect, useState } from "react";
import {
  listEvents,
  getRegistration,
  getUserByFirebaseUid,
  findUserByEmail,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import { useEventContext } from "./EventContext.jsx";
import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/MyEvents.css";

export default function MyEvents() {
  const { registeredEventIds } = useEventContext();

  const [currentUser, setCurrentUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
  const loadEvents = async () => {
    const { data } = await listEvents(getDataConnectClient());
    const allEvents = data?.eventLists || [];

    const myEvents = allEvents.filter(event =>
      registeredEventIds.has(event.id)
    );

    setRegisteredEvents(myEvents);
  };

  loadEvents();
}, [registeredEventIds]);

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

  return (
    <div className="my-events-container">
      <h1>My Events</h1>

      {registeredEvents.length === 0 ? (
        <p>No registered events.</p>
      ) : (
        registeredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={true}
            onShare={handleShare}
            onOpen={setSelectedEvent}
          />
        ))
      )}

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onShare={handleShare}
        isRegistered={true}
      />
    </div>
  );
}