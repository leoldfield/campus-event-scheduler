import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "./EventContext.jsx";

import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";
import "../css/MyEvents.css";

// You can reuse Events.css layout styles here or keep them global!
import "../css/Events.css";

import pencil from "../assets/edit-pencil.png";
import testimage from "../assets/UALR-banner.jpg";

import { deleteGoogleCalendarEvent } from "../googleCalendar";
import { auth } from "../firebase";

export default function MyEvents() {
  const navigate = useNavigate();

  const {
    events,
    registeredEventIds,
    unregisterFromEvent,
    dbUserId,
  } = useEventContext();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [unregisterLoading, setUnregisterLoading] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // keep minimal auth only for Google Calendar cleanup
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // =========================
  // Derived state
  // =========================
  // 1. Get base registered events
  const registeredEvents = useMemo(() => {
    return events.filter((e) => registeredEventIds.has(e.id));
  }, [events, registeredEventIds]);

  // 2. Apply filters to registered events
  const filteredRegisteredEvents = useMemo(() => {
    return registeredEvents.filter((event) => {
      const matchesSearch = event.eventname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventdesc.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      const now = new Date();
      const eventDate = new Date(event.starttime); // Assuming starttime exists
      if (selectedStatus === "upcoming") matchesStatus = eventDate >= now;
      if (selectedStatus === "past") matchesStatus = eventDate < now;

      return matchesSearch && matchesStatus;
    });
  }, [registeredEvents, searchTerm, selectedStatus]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // =========================
  // Unregister
  // =========================
  const handleUnregister = async (eventId) => {
    setUnregisterLoading(eventId);
    try {
      // Centralize unregistration logic by passing currentUser to the context
      await unregisterFromEvent(eventId, currentUser);
      setSelectedEventId(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUnregisterLoading(null);
    }
  };

  // =========================
  // Share & Edit
  // =========================
  const handleShare = async (event) => {
    const url = `${window.location.origin}/event/${event.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.eventname, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleEdit = (event) => {
    navigate("/create", { state: { event } });
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="my-events-padding">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>

        {/* HERO SECTION FOR MY EVENTS */}
        <section className="hero-section" style={{ marginBottom: "40px", padding: "60px 20px" }}>
          <div className="hero-content">
            <h1>My Registered Events</h1>
            <p>Manage your upcoming schedule, edit your events, and sync with your calendar.</p>
          </div>
        </section>

        {registeredEvents.length === 0 ? (
          <div className="empty-state-wrapper">
            <div className="empty-state-icon">
              {/* A nice, soft calendar/ticket emoji or SVG */}
              🎟️
            </div>
            <h2>Your schedule is wide open!</h2>
            <p>You haven't registered for any events yet. Discover what's happening around campus and get involved.</p>
            <button
              className="empty-state-btn"
              onClick={() => navigate("/")}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <section className="events-section">
            <div className="events-page-layout">

              {/* LEFT SIDEBAR: EXPANDABLE */}
              <aside className={`filters-sidebar ${isFilterOpen ? "open" : "closed"}`}>
                {isFilterOpen ? (
                  <div className="filter-content-wrapper">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h3 style={{ margin: 0, borderBottom: "none", paddingBottom: 0 }}>Filter My Events</h3>
                      <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)}>✕</button>
                    </div>

                    <div className="filter-group">
                      <label>Search</label>
                      <input type="text" className="ua-filter-input" placeholder="Search my events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="filter-group">
                      <label>Time</label>
                      <select className="ua-filter-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} >
                        <option value="all">All events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                      </select>
                    </div>

                    <button className="ua-filter-clear" onClick={() => { setSearchTerm(""); setSelectedStatus("all"); }}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <button className="open-filter-tab" onClick={() => setIsFilterOpen(true)}>
                    <span className="vertical-text">FILTERS</span>
                  </button>
                )}
              </aside>

              {/* RIGHT MAIN CONTENT */}
              <div className="events-main-content">
                <div className={`events-grid ${isFilterOpen ? "grid-3" : "grid-4"}`}>
                  {filteredRegisteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isRegistered={true}
                      loading={unregisterLoading === event.id}
                      onRegister={handleUnregister}
                      onShare={handleShare}
                      onOpen={(event) => setSelectedEventId(event.id)}
                      showEdit={event.eventcoord === dbUserId}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>

                {filteredRegisteredEvents.length === 0 && (
                  <p style={{ textAlign: "center", width: "100%", color: "#6b7280" }}>No events match your filters.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* MODAL */}
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
          onRegister={handleUnregister}
          isRegistered={true}
          onShare={handleShare}
          loading={unregisterLoading === selectedEvent?.id}
        />
      </div>
    </div>
  );
}