import React, { useEffect, useMemo, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import {
  createRegistration,
  deleteRegistration,
  findUserByEmail,
  getRegistration,
  getUserByFirebaseUid,
  listEvents,
} from "../dataconnect-generated";
import { getDataConnectClient, auth } from "../firebase";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/Events.css";
import "../css/EventModal.css";

export default function Events() {
  const { registeredEventIds, setRegisteredEventIds } = useEventContext();
  const [prevUserId, setPrevUserId] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEventStatus, setSelectedEventStatus] = useState("all");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [dbUserId, setDbUserId] = useState("");

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);

      const newUserId = user?.uid || null;

      if (newUserId !== prevUserId) {
        setRegisteredEventIds(new Set());
        setPrevUserId(newUserId);
      }

      if (!user || user.isAnonymous) {
        setFirstName("");
        setDbUserId("");
        setRegisteredEventIds(new Set());
        setNameError("");
        setLoadingName(false);
        return;
      }
    });

    return () => unsubscribe();
  }, [prevUserId]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (!currentUser) return;

        const { data } = await listEvents(getDataConnectClient());
        const eventList = data?.eventLists || [];

        setEvents(eventList);

        const registeredIds = new Set();

        if (currentUser && !currentUser.isAnonymous) {
          let dbUser = null;
          const loadUserInfo = async () => {
            try {
              let matchedUser = null;

              try {
                const userResult = await getUserByFirebaseUid(getDataConnectClient(), {
                  firebaseUid: currentUser.uid,
                });
                dbUser = userResult.data?.userLists?.[0];
              } catch { }

              if (!dbUser && currentUser.email) {
                const emailResult = await findUserByEmail(getDataConnectClient(), {
                  email: currentUser.email.toLowerCase(),
                });
                dbUser = emailResult.data?.userLists?.[0];
              }

              if (dbUser?.id) {
                for (const event of eventList) {
                  try {
                    const reg = await getRegistration(getDataConnectClient(), {
                      eventId: event.id,
                      userId: dbUser.id,
                    });

                    if (reg.data?.registration) {
                      registeredIds.add(event.id);
                    }
                  } catch { }
                }
              }
              if (matchedUser?.firstname) {
                setFirstName(matchedUser.firstname);
              } else {
                setFirstName(user.displayName || "");
              }

              setDbUserId(matchedUser?.id || "");
              setNameError("");
            } catch (error) {
              console.error("Failed to load user name", error);
              setNameError(error?.message || "Failed to load user name.");
              setFirstName(user.displayName || "");
              setDbUserId("");
            } finally {
              setLoadingName(false);
            }

            setRegisteredEventIds((prev) => {
              const merged = new Set(prev);
              registeredIds.forEach(id => merged.add(id));
              return merged;
            });
          } catch (error) {
            try {
              await signInAnonymously(auth);
              const { data } = await listEvents(getDataConnectClient());
              setEvents(data?.eventLists || []);
            } catch (err) {
              setEventsError(err.message);
              loadUserInfo();
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
    } finally {
      setLoadingEvents(false);
    }
  };

  loadEvents();
}, [currentUser]);
  }, []);

useEffect(() => {
  const loadUserRegistrations = async () => {
    if (!isSignedInUser || !dbUserId || events.length === 0) {
      setRegisteredEventIds(new Set());
      return;
    }

    try {
      const registrationChecks = await Promise.all(
        events.map(async (event) => {
          const result = await getRegistration(getDataConnectClient(), {
            eventId: event.id,
            userId: dbUserId,
          });

          return result.data?.registration ? event.id : null;
        })
      );

      setRegisteredEventIds(new Set(registrationChecks.filter(Boolean)));
    } catch (error) {
      console.error("Failed to load registrations", error);
    }
  };

  loadUserRegistrations();
}, [isSignedInUser, dbUserId, events]);

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
  if (!isSignedInUser || !currentUser) return;

  setRegisterLoadingId(eventId);

  try {
    let resolvedUserId = dbUserId;
    let dbUser = null;

    const userResult = await getUserByFirebaseUid(getDataConnectClient(), {
      firebaseUid: currentUser.uid,
    });

    dbUser = userResult.data?.userLists?.[0];

    if (!dbUser && currentUser.email) {
      const emailResult = await findUserByEmail(getDataConnectClient(), {
        email: currentUser.email.toLowerCase(),
      });
      dbUser = emailResult.data?.userLists?.[0];
    }

    if (!dbUser?.id) throw new Error("User not found");
    if (!resolvedUserId) {
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

      resolvedUserId = dbUser?.id || "";
      setDbUserId(resolvedUserId);
    }

    if (!resolvedUserId) {
      throw new Error("Could not find the current user in the database.");
    }

    const existingRegistration = await getRegistration(getDataConnectClient(), {
      eventId,
      userId: resolvedUserId,
    });

    if (existingRegistration.data?.registration) {
      setRegisterMessage("You are already registered for this event.");
      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.add(eventId);
        return updated;
      });
      return;
    }

    await createRegistration(getDataConnectClient(), {
      eventId,
      userId: resolvedUserId,
      notif: false,
    });

    setRegisteredEventIds((prev) => {
      const updated = new Set(prev);
      updated.add(eventId);
      return updated;
    });

    setRegisterMessage("Registered!");
  } catch (err) {
    setRegisterError(err.message);

    setRegisterMessage("Registration successful.");
    setRegisterError("");
  } catch (error) {
    const errorMessage = String(error?.message || "");

    if (/already exists|duplicate|unique/i.test(errorMessage)) {
      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.add(eventId);
        return updated;
      });
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
  } catch { }
  const handleUnregister = async (eventId) => {
    setRegisterMessage("");
    setRegisterError("");

    if (!isSignedInUser || !currentUser) {
      setRegisterError("Please log in before unregistering from an event.");
      return;
    }

    if (!dbUserId) {
      setRegisterError("Could not find the current user in the database.");
      return;
    }

    setRegisterLoadingId(eventId);

    try {
      await deleteRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUserId,
      });

      setRegisteredEventIds((prev) => {
        const updated = new Set(prev);
        updated.delete(eventId);
        return updated;
      });

      setRegisterMessage("You have been unregistered from the event.");
      setRegisterError("");
    } catch (error) {
      console.error("Failed to unregister from event", error);
      setRegisterError(error?.message || "Failed to unregister from the event.");
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
        selectedLocation === "all" ||
        (event.location || "") === selectedLocation;

      const matchesEventStatus =
        selectedEventStatus === "all" ||
        (selectedEventStatus === "ongoing" && event.eventstatus === true) ||
        (selectedEventStatus === "cancelled" && event.eventstatus === false);

      let matchesStatus = true;
      if (selectedStatus === "upcoming") {
        matchesStatus = isValidDate ? eventStart >= now : false;
      } else if (selectedStatus === "past") {
        matchesStatus = isValidDate ? eventStart < now : false;
      }

      return (
        matchesSearch &&
        matchesLocation &&
        matchesEventStatus &&
        matchesStatus
      );
    });
  }, [
    events,
    searchTerm,
    selectedLocation,
    selectedStatus,
    selectedEventStatus,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedEventStatus("all");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      <h1>UA Little Rock Campus Events</h1>

      <p>
        Find upcoming University of Arkansas at Little Rock events and register easily.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
        <div style={{ minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Search events
          </label>
          <input
            type="text"
            placeholder="Search by name, description, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Filter by location
          </label>
          <select
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
          {isSignedInUser && (
            <h2>
              Welcome {loadingName ? "..." : ""}
              {!loadingName && firstName ? `, ${firstName}` : ""}
            </h2>
          )}

          <p>Find upcoming University of Arkansas at Little Rock events and register easily.</p>

          {loadingEvents ? <p>Loading events...</p> : null}
          {eventsError ? <p style={{ color: "red" }}>{eventsError}</p> : null}
          {registerError ? <p style={{ color: "red" }}>{registerError}</p> : null}
          {registerMessage ? <p style={{ color: "green" }}>{registerMessage}</p> : null}
          {!isSignedInUser ? <p>Please log in to register for events.</p> : null}
          {nameError && !firstName ? <p>Could not load user name.</p> : null}

          {!loadingEvents && !eventsError && events.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              Search events
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event name, description, or location"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              Filter by location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
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
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              Filter by status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            >
              <option value="all">All events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
              Filter by event status
            </label>
            <select
              value={selectedEventStatus}
              onChange={(e) => setSelectedEventStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            >
              <option value="all">All statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              onClick={clearFilters}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                cursor: "pointer",
                backgroundColor: "#fff",
                fontWeight: "600",
                width: "100%",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Filter by status
          </label>
          <select
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

        <div style={{ minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Event status
          </label>
          <select
            value={selectedEventStatus}
            onChange={(e) => setSelectedEventStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="all">All statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button
            onClick={clearFilters}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={registeredEventIds.has(event.id)}
            loading={registerLoadingId === event.id}
            onRegister={handleRegister}
            onShare={handleShare}
            onOpen={setSelectedEvent}
          />
        ))}
        {filteredEvents.map((event) => {
          const isRegistered = registeredEventIds.has(event.id);
          const isBusy = registerLoadingId === event.id;

          return (
            <div
              key={event.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{event.eventname}</h2>
              <p><strong>Start:</strong> {formatEventDate(event.starttime)}</p>
              <p><strong>End:</strong> {formatEventDate(event.endtime)}</p>
              <p><strong>Location:</strong> {event.location || "TBD"}</p>
              <p>{event.eventdesc}</p>

              {isSignedInUser ? (
                <button
                  onClick={() =>
                    isRegistered ? handleUnregister(event.id) : handleRegister(event.id)
                  }
                  disabled={isBusy}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    backgroundColor: isRegistered ? "#666" : "#b30000",
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  {isBusy
                    ? isRegistered
                      ? "Unregistering..."
                      : "Registering..."
                    : isRegistered
                      ? "Unregister"
                      : "Register"}
                </button>
              ) : null}
            </div>
          );
        })}

        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          onShare={handleShare}
          isRegistered={selectedEvent && registeredEventIds.has(selectedEvent.id)}
          loading={registerLoadingId === selectedEvent?.id}
        />
      </div>
      );
}