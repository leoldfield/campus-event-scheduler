import React, { useEffect, useState } from "react";
import {
  listEvents,
  getRegistration,
  getUserByFirebaseUid,
  findUserByEmail,
  deleteRegistration,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import { useEventContext } from "./EventContext.jsx";
import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import {
  deleteGoogleCalendarEvent,
} from "../googleCalendar";
import "../css/MyEvents.css";

export default function MyEvents() {
  const { setRegisteredEventIds } = useEventContext();

  const [currentUser, setCurrentUser] = useState(null);
  const [dbUserId, setDbUserId] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [unregisterLoading, setUnregisterLoading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadMyEvents = async () => {
      if (!currentUser || currentUser.isAnonymous) {
        setDbUserId("");
        setRegisteredEvents([]);
        setRegisteredEventIds(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let dbUser = null;

        try {
          const userResult = await getUserByFirebaseUid(getDataConnectClient(), {
            firebaseUid: currentUser.uid,
          });
          dbUser = userResult.data?.userLists?.[0] || null;
        } catch {}

        if (!dbUser && currentUser.email) {
          const emailResult = await findUserByEmail(getDataConnectClient(), {
            email: currentUser.email.toLowerCase(),
          });
          dbUser = emailResult.data?.userLists?.[0] || null;
        }

        if (!dbUser?.id) {
          setDbUserId("");
          setRegisteredEvents([]);
          setRegisteredEventIds(new Set());
          setLoading(false);
          return;
        }

        setDbUserId(dbUser.id);

        const { data } = await listEvents(getDataConnectClient());
        const allEvents = data?.eventLists || [];

        const myEvents = [];
        const registeredIds = new Set();

        for (const event of allEvents) {
          try {
            const reg = await getRegistration(getDataConnectClient(), {
              eventId: event.id,
              userId: dbUser.id,
            });

            if (reg.data?.registration) {
              myEvents.push(event);
              registeredIds.add(event.id);
            }
          } catch {}
        }

        setRegisteredEvents(myEvents);
        setRegisteredEventIds(registeredIds);
      } catch (err) {
        console.error("Failed to load My Events:", err);
        setRegisteredEvents([]);
        setRegisteredEventIds(new Set());
      } finally {
        setLoading(false);
      }
    };

    loadMyEvents();
  }, [currentUser, setRegisteredEventIds]);

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
    } catch {}
  };

  const handleUnregister = async (eventId) => {
    if (!dbUserId) return;

    setUnregisterLoading(eventId);

    try {
      const event = registeredEvents.find((e) => e.id === eventId);

      await deleteRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUserId,
      });

      if (event && currentUser?.email) {
        try {
          await deleteGoogleCalendarEvent(event, currentUser);
        } catch (calendarError) {
          console.warn("Google Calendar deletion failed", calendarError);
          alert(
            "Unregistered from the event, but the Google Calendar entry could not be removed."
          );
        }
      }

      setRegisteredEvents((prev) => prev.filter((event) => event.id !== eventId));

      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.delete(eventId);
        return updated;
      });

      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error("Error unregistering:", err.message);
      alert("Failed to unregister: " + err.message);
    } finally {
      setUnregisterLoading(null);
    }
  };

  return (
    <div className="my-events-page">
      <h1>My Events</h1>

      {loading ? (
        <p>Loading your events...</p>
      ) : registeredEvents.length === 0 ? (
        <p>No registered events.</p>
      ) : (
        registeredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => setSelectedEvent(event)}
            onRegister={handleUnregister}
            onShare={handleShare}
            isRegistered={true}
            loading={unregisterLoading === event.id}
          />
        ))
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleUnregister}
          onShare={handleShare}
          isRegistered={true}
          loading={unregisterLoading === selectedEvent?.id}
        />
      )}
    </div>
  );
}