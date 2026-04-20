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
  const [currentUser, setCurrentUser] = useState(null);

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
        }
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [currentUser]);

  const handleRegister = async (eventId) => {
    if (!isSignedInUser || !currentUser) return;

    setRegisterLoadingId(eventId);

    try {
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

      await createRegistration(getDataConnectClient(), {
        eventId,
        userId: dbUser.id,
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
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