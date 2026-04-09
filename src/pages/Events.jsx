import React, { useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import {
  createRegistration,
  findUserByEmail,
  getRegistration,
  getUserByFirebaseUid,
  listEvents,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";

export default function Events() {
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");
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
          let matchedUser = null;

          try {
            const uidResult = await getUserByFirebaseUid(getDataConnectClient(), {
              firebaseUid: user.uid,
            });
            matchedUser = uidResult.data?.userLists?.[0] || null;
          } catch (uidError) {
            console.warn("User not found by firebase uid, trying email fallback", uidError);
          }

          if (!matchedUser && user.email) {
            const emailResult = await findUserByEmail(getDataConnectClient(), {
              email: user.email.toLowerCase(),
            });
            matchedUser = emailResult.data?.userLists?.[0] || null;
          }

          if (matchedUser?.firstname) {
            setFirstName(matchedUser.firstname);
            setNameError("");
            return;
          }

          setFirstName(user.displayName || "");
          setNameError("");
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
        setEventsError("");
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

  const handleRegister = async (eventId) => {
    setRegisterMessage("");
    setRegisterError("");

    if (!isSignedInUser || !currentUser) {
      setRegisterError("Please log in before registering for an event.");
      return;
    }

    setRegisterLoadingId(eventId);

    try {
      let dbUser = null;

      try {
        const userResult = await getUserByFirebaseUid(getDataConnectClient(), {
          firebaseUid: currentUser.uid,
        });
        dbUser = userResult.data?.userLists?.[0] || null;
      } catch (uidError) {
        console.warn("User not found by firebase uid, trying email fallback", uidError);
      }

      if (!dbUser?.id && currentUser.email) {
        const emailResult = await findUserByEmail(getDataConnectClient(), {
          email: currentUser.email.toLowerCase(),
        });
        dbUser = emailResult.data?.userLists?.[0] || null;
      }

      if (!dbUser?.id) {
        throw new Error("Could not find the current user in the database.");
      }

      const existingRegistration = await getRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUser.id,
      });

      if (existingRegistration.data?.registration) {
        setRegisterMessage("You are already registered for this event.");
        setRegisterError("");
        return;
      }

      await createRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUser.id,
        notif: false,
      });

      setRegisterMessage("Registration successful.");
      setRegisterError("");
    } catch (error) {
      const errorMessage = String(error?.message || "");

      if (/already exists|duplicate|unique/i.test(errorMessage)) {
        setRegisterMessage("You are already registered for this event.");
        setRegisterError("");
      } else {
        console.error("Failed to register for event", error);
        setRegisterError(error?.message || "Failed to register for the event.");
      }
    } finally {
      setRegisterLoadingId(null);
    }
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
      {registerError ? <p style={{ color: "#b00020" }}>{registerError}</p> : null}
      {registerMessage ? <p style={{ color: "#0a7a28" }}>{registerMessage}</p> : null}
      {!isSignedInUser ? <p>Please log in to register for events.</p> : null}
      {nameError && !firstName ? (
        <p style={{ color: "#b00020" }}>Could not load user name.</p>
      ) : null}

      <div className="grid">
        {events.map((event) => (
          <div className="card" key={event.id}>
            <h2>{event.eventname}</h2>
            <p><strong>Start:</strong> {formatEventDate(event.starttime)}</p>
            <p><strong>End:</strong> {formatEventDate(event.endtime)}</p>
            <p><strong>Location:</strong> {event.location || "TBD"}</p>
            <p>{event.eventdesc}</p>

            <button
              className="button"
              onClick={() => handleRegister(event.id)}
              disabled={registerLoadingId === event.id}
            >
              {registerLoadingId === event.id ? "Registering..." : "Register"}
            </button>
          </div>
        ))}
      </div>

      {!loadingEvents && !eventsError && events.length === 0 ? (
        <p>No events are available right now.</p>
      ) : null}
    </div>
  );
}