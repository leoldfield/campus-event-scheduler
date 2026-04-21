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
import "../css/MyEvents.css";

export default function MyEvents() {
  const { registeredEventIds, setRegisteredEventIds } = useEventContext();

  const [currentUser, setCurrentUser] = useState(null);
  const [dbUserId, setDbUserId] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [unregisterLoading, setUnregisterLoading] = useState(null);

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

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

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

      if (dbUser?.id) {
        setDbUserId(dbUser.id);
      }
    };

    loadUserData();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

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

  const handleUnregister = async (eventId) => {
    if (!dbUserId) return;

    setUnregisterLoading(eventId);

    try {
      await deleteRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUserId,
      });

      // Verify deletion by checking if registration still exists
      try {
        const verifyReg = await getRegistration(getDataConnectClient(), {
          eventId,
          userId: dbUserId,
        });

        if (verifyReg.data?.registration) {
          throw new Error("Deletion verification failed - registration still exists");
        }
      } catch (verifyErr) {
        if (verifyErr.message.includes("still exists")) {
          throw verifyErr;
        }
        // Other errors during verification (like 404) are OK - means it's deleted
      }

      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.delete(eventId);
        return updated;
      });
    } catch (err) {
      console.error("Error unregistering:", err.message);
      alert("Failed to unregister: " + err.message);
    } finally {
      setUnregisterLoading(null);
    }
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
            onRegister={handleUnregister}
            onShare={handleShare}
            onOpen={setSelectedEvent}
            loading={unregisterLoading === event.id}
          />
        ))
      )}

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleUnregister}
        onShare={handleShare}
        isRegistered={true}
        loading={unregisterLoading === selectedEvent?.id}
      />
    </div>
  );
}