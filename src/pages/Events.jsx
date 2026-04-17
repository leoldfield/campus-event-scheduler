import React, { useEffect, useMemo, useState } from "react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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
        const isUnauthenticated =
          /unauthenticated|requires a signed-in user/i.test(errorMessage);

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

  const uniqueLocations = useMemo(() => {
    const locations = events
      .map((event) => (event.location || "").trim())
      .filter(Boolean);

    return [...new Set(locations)].sort((a, b) => a.localeCompare(b));
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
  };

  return (
    <div className="introText">
      <h1>UA Little Rock Campus Events</h1>

      {isSignedInUser && (
        <h2>
          Welcome {loadingName ? "..." : ""}
          {!loadingName && firstName ? `, ${firstName}` : ""}
        </h2>
      )}

      <p>
        Find upcoming University of Arkansas at Little Rock events and register
        easily.
      </p>

      {loadingEvents ? <p>Loading events...</p> : null}
      {eventsError ? <p style={{ color: "crimson" }}>{eventsError}</p> : null}
      {registerError ? <p style={{ color: "crimson" }}>{registerError}</p> : null}
      {registerMessage ? (
        <p style={{ color: "green" }}>{registerMessage}</p>
      ) : null}
      {!isSignedInUser ? <p>Please log in to register for events.</p> : null}
      {nameError && !firstName ? <p>Could not load user name.</p> : null}

      {!loadingEvents && !eventsError && events.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.25fr 1fr 1fr 220px",
            columnGap: "18px",
            rowGap: "12px",
            margin: "24px 0",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            background: "#f8f9fa",
            alignItems: "end",
          }}
        >
          <div>
            <label
              htmlFor="event-search"
              style={{ display: "block", marginBottom: "6px" }}
            >
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
              }}
            />
          </div>

          <div>
            <label
              htmlFor="location-filter"
              style={{ display: "block", marginBottom: "6px" }}
            >
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

          <div>
            <label
              htmlFor="status-filter"
              style={{ display: "block", marginBottom: "6px" }}
            >
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
              }}
            >
              <option value="all">All events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              onClick={clearFilters}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {!loadingEvents && !eventsError && filteredEvents.length === 0 && events.length > 0 ? (
        <p>No events match your current search or filters.</p>
      ) : null}

      {filteredEvents.map((event) => (
        <div
          key={event.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h2>{event.eventname}</h2>
          <p>
            <strong>Start:</strong> {formatEventDate(event.starttime)}
          </p>
          <p>
            <strong>End:</strong> {formatEventDate(event.endtime)}
          </p>
          <p>
            <strong>Location:</strong> {event.location || "TBD"}
          </p>
          <p>{event.eventdesc}</p>

          <button
            onClick={() => handleRegister(event.id)}
            disabled={registerLoadingId === event.id}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: registerLoadingId === event.id ? "not-allowed" : "pointer",
              backgroundColor: "#b30000",
              color: "white",
              fontWeight: "600",
            }}
          >
            {registerLoadingId === event.id ? "Registering..." : "Register"}
          </button>
        </div>
      ))}

      {!loadingEvents && !eventsError && events.length === 0 ? (
        <p>No events are available right now.</p>
      ) : null}
    </div>
  );
}