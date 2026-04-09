import React, { useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { findUserByEmail, getUserByFirebaseUid, listEvents } from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";

export default function Events() {
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);

      if (!user || user.isAnonymous) {
        setFirstName("");
        setNameError("");
        setLoadingName(false);
        return;
      }

      setLoadingName(true);

      const loadUserFirstName = async () => {
        try {
          // Primary path: direct lookup by Firebase UID.
          const uidResult = await getUserByFirebaseUid(getDataConnectClient(), { firebaseUid: user.uid });
          const uidMatch = uidResult.data?.userLists?.[0];
          if (uidMatch?.firstname) {
            setFirstName(uidMatch.firstname);
            return;
          }

          // Migration fallback: lookup by email for users not backfilled yet.
          if (user.email) {
            const emailResult = await findUserByEmail(getDataConnectClient(), {
              email: user.email.toLowerCase(),
            });
            const emailMatch = emailResult.data?.userLists?.[0];
            if (emailMatch?.firstname) {
              setFirstName(emailMatch.firstname);
              return;
            }
          }

          setFirstName(user.displayName || "");
        } catch (error) {
          console.error("Failed to load user name", error);
          setNameError(error?.message || "Failed to load user name.");
          setFirstName(user.displayName || "");
        } finally {
          setLoadingName(false);
        }
      };

      loadUserFirstName();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await auth.authStateReady();
        const { data } = await listEvents(getDataConnectClient());
        setEvents(data?.eventLists || []);
      } catch (error) {
        const errorMessage = String(error?.message || "");
        const isUnauthenticated = /unauthenticated|requires a signed-in user/i.test(errorMessage);

        if (isUnauthenticated) {
          try {
            const credential = await signInAnonymously(auth);
            await credential.user.getIdToken(true);
            const { data } = await listEvents(getDataConnectClient());
            setEvents(data?.eventLists || []);
            setEventsError("");
            return;
          } catch (retryError) {
            console.error("Failed to load events after guest sign-in", retryError);
            setEventsError(retryError?.message || "Failed to load events.");
            return;
          }
        }

        console.error("Failed to load events", error);
        setEventsError(error?.message || "Failed to load events.");
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const formatEventDate = (timestamp) => {
    const eventDate = new Date(timestamp);
    if (Number.isNaN(eventDate.getTime())) {
      return "Invalid date";
    }

    return eventDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <h1>UA Little Rock Campus Events</h1>
      {isSignedInUser && (
        <h2>
          Welcome
          {loadingName ? "..." : ""}
          {!loadingName && firstName ? `, ${firstName}` : ""}
        </h2>
      )}
      <p>Find upcoming University of Arkansas at Little Rock events and register easily.</p>

      {loadingEvents ? <p>Loading events...</p> : null}
      {eventsError ? <p style={{ color: "#b00020" }}>{eventsError}</p> : null}

      <div className="grid">
        {events.map((event) => (
          <div className="card" key={event.id}>
            <h2>{event.eventname}</h2>
            <p><strong>Start:</strong> {formatEventDate(event.starttime)}</p>
            <p><strong>End:</strong> {formatEventDate(event.endtime)}</p>
            <p><strong>Location:</strong> {event.location || "TBD"}</p>
            <p>{event.eventdesc}</p>
            <button className="button">Register</button>
          </div>
        ))}
      </div>

      {!loadingEvents && !eventsError && events.length === 0 ? (
        <p>No events are available right now.</p>
      ) : null}
    </div>
  );
}