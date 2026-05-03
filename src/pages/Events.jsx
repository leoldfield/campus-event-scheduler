import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "./EventContext.jsx";
import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";

import "../css/Events.css";
import "../css/EventModal.css";

import peopleBanner1 from "../assets/PeopleBanner1.png";
import peopleBanner2 from "../assets/PeopleBanner2.png";
import academicbg from "../assets/category-bg/academic-bg.jpg";
import socialbg from "../assets/category-bg/social-bg.jpg";
import sportsbg from "../assets/category-bg/sports-bg.jpg";
import artbg from "../assets/category-bg/arts-bg.jpg";
import technologybg from "../assets/category-bg/technology-bg.jpg";
import careerbg from "../assets/category-bg/career-bg.jpg";

// =========================
// NEW IMAGE CATEGORY DATA
// =========================
const categoryList = [
  { name: "Academic", image: academicbg },
  { name: "Social", image: socialbg },
  { name: "Sports", image: sportsbg },
  { name: "Arts", image: artbg },
  { name: "Technology", image: technologybg },
  { name: "Career", image: careerbg },
];

import {
  getUserByFirebaseUid,
  findUserByEmail,
} from "../dataconnect-generated";

import { auth, getDataConnectClient } from "../firebase";

export default function Events() {
  const navigate = useNavigate();

  const {
    registeredEventIds,
    registerForEvent,
    addNotification, 
    dbUserId,
    events,
    refreshEvents,
  } = useEventContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);

  const [visibleCount, setVisibleCount] = useState(8);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // =========================
  // EVENTS
  // =========================
  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // ==========================================
  // AUTO-OPEN SHARED EVENT MODAL (NEW)
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedEventId = params.get("eventId");

    if (sharedEventId && events.length > 0) {
      setSelectedEventId(sharedEventId);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [events]);

  // =========================
  // AUTH + NAME
  // =========================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (!user || user.isAnonymous) {
        setFirstName("");
        setLoadingName(false);
        return;
      }

      setLoadingName(true);

      try {
        let matchedUser = null;
        try {
          const uidResult = await getUserByFirebaseUid(
            getDataConnectClient(),
            { firebaseUid: user.uid }
          );
          matchedUser = uidResult.data?.userLists?.[0];
        } catch { }

        if (!matchedUser && user.email) {
          const emailResult = await findUserByEmail(
            getDataConnectClient(),
            { email: user.email.toLowerCase() }
          );
          matchedUser = emailResult.data?.userLists?.[0];
        }

        setFirstName(matchedUser?.firstname || user.displayName || "");
      } catch (err) {
        setFirstName(user.displayName || "");
      } finally {
        setLoadingName(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async (eventId) => {
    if (!isSignedInUser) return;
    setRegisterLoadingId(eventId);
    try {
      await registerForEvent(eventId, currentUser);
      setSelectedEventId(null);
      
      const eventObj = events.find((e) => e.id === eventId);
      const eventName = eventObj ? eventObj.eventname : "the event";

      addNotification({ 
        type: "success", 
        title: "Registered!", 
        message: `You successfully registered for ${eventName}.` 
      });
      
    } catch (err) {
      console.error(err);
      addNotification({ 
        type: "error", 
        title: "Error", 
        message: "Failed to register. Please try again." 
      });
    } finally {
      setRegisterLoadingId(null);
    }
  };

  // =========================
  // SHARE 
  // =========================
  const handleShare = async (event) => {
    const shareUrl = `${window.location.origin}/events?eventId=${event.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.eventname,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // ✅ Fixed object format
        addNotification({ type: "success", title: "Shared!", message: "Event link copied to clipboard!" });
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (event) => {
    navigate("/create", { state: { event } });
  };

  // =========================
  // FILTER OPTIONS
  // =========================
  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map((e) => e.location).filter(Boolean))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      if (registeredEventIds.has(event.id)) return false;

      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !query ||
        event.eventname?.toLowerCase().includes(query) ||
        event.eventdesc?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query);

      const matchesLocation =
        selectedLocation === "all" ||
        event.location === selectedLocation;

      const eventStart = new Date(event.starttime);

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "upcoming" && eventStart >= now) ||
        (selectedStatus === "past" && eventStart < now);

      const matchesCategory =
        selectedCategory === "all" ||
        (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesLocation && matchesStatus && matchesCategory;
    });
  }, [events, searchTerm, selectedLocation, selectedStatus, selectedCategory, registeredEventIds]);

  const handleCategoryClick = (categoryName) => {
    const lowerCat = categoryName.toLowerCase();
    setSelectedCategory((prev) => (prev === lowerCat ? "all" : lowerCat));
    setVisibleCount(8);
    window.scrollTo({ top: 800, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setVisibleCount(8);
    setSelectedCategory("all");
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* HERO / INTRO SECTION */}
      <div className="hero-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1>UA Little Rock Campus Events</h1>
            <p>Find upcoming University of Arkansas at Little Rock events, sync your schedule, and register easily.</p>
            {isSignedInUser && (
              <h2 className="hero-welcome">
                {getTimeOfDayGreeting()}, {firstName}!
                <p>Ready to see what's happening on campus today?</p>
              </h2>
            )}
          </div>
        </section>
      </div>

      <section className="category-section">
        <div className="section-header">
          <h2>Explore by Category</h2>
        </div>

        <div className="category-grid">
          {categoryList.map((cat) => (
            <div
              key={cat.name}
              className={`category-card ${selectedCategory === cat.name.toLowerCase() ? "selected" : ""}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div
                className="card-background"
                style={{ backgroundImage: `url(${cat.image})` }}
              >
                <div className="card-overlay" />
              </div>
              <div className="card-content">
                <h3>{cat.name.toUpperCase()}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="events-section" style={{ margin: "40px 0" }}>

        {/* MODIFIED: HORIZONTAL HEADER FOR MOBILE FIX */}
        <div className="events-header" style={{ marginBottom: "24px" }}>
          <h2>Upcoming Events</h2>
          <button
            className="filter-toggle-btn mobile-only-btn"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {isFilterOpen ? "Close Filters" : "Filters"}
          </button>
        </div>

        <div className="events-page-layout">
          {/* LEFT SIDEBAR FILTERS */}
          <aside className={`filters-sidebar ${isFilterOpen ? "open" : "closed"}`}>
            {isFilterOpen ? (
              <div className="filters-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: 0 }}>Filters</h3>
                  <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)}>
                    ✖
                  </button>
                </div>

                <label>Search</label>
                <input
                  type="text"
                  placeholder="e.g. Study Session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ua-filter-input"
                  style={{ marginBottom: "16px" }}
                />

                <label>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="ua-filter-select"
                  style={{ marginBottom: "16px" }}
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>

                <label>Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="ua-filter-select"
                  style={{ marginBottom: "16px" }}
                >
                  <option value="all">Any Location</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>

                <button className="ua-filter-clear" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <button className="open-filter-tab desktop-only-btn" onClick={() => setIsFilterOpen(true)}>
                <span className="vertical-text">FILTERS</span>
              </button>
            )}
          </aside>

          {/* MAIN EVENT GRID */}
          <div className="events-main-list" style={{ flex: 1, minWidth: 0 }}>
            {filteredEvents.length === 0 ? (
              <div className="no-events-container">
                <p>No events found for this category or search term.</p>
                <button className="cta-button" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`events-grid ${isFilterOpen ? "grid-3" : "grid-4"}`}>
                  {filteredEvents.slice(0, visibleCount).map((event) => {
                    const isReg = registeredEventIds.has(event.id);
                    const isLoading = registerLoadingId === event.id;

                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        currentUser={currentUser}
                        isRegistered={isReg}
                        loading={isLoading}
                        onRegister={handleRegister}
                        onShare={handleShare}
                        onOpen={(event) => setSelectedEventId(event.id)}
                        showEdit={String(event.eventcoord).toLowerCase() === String(dbUserId).toLowerCase()}
                        onEdit={handleEdit}
                      />
                    );
                  })}
                </div>

                {filteredEvents.length > 8 && (
                  <div className="see-more-container" style={{ textAlign: "center", marginTop: "40px" }}>
                    <button
                      className="cta-button"
                      onClick={() => {
                        if (visibleCount >= filteredEvents.length) {
                          setVisibleCount(8);
                          window.scrollTo({ top: 420, behavior: 'smooth' });
                        } else {
                          setVisibleCount((prev) => prev + 8);
                        }
                      }}
                    >
                      {visibleCount >= filteredEvents.length ? "See Less Events" : "See More Events"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get involved on campus in three easy steps.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Discover Events</h3>
            <p>Browse the calendar or use our smart filters to find activities, workshops, and socials that match your interests.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Register & Track</h3>
            <p>Secure your spot with one click. Manage all your upcoming events effortlessly in your personalized dashboard.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Engage & Connect</h3>
            <p>Attend events, meet fellow Trojans, and make the most out of your UA Little Rock experience!</p>
          </div>
        </div>
      </section>

      {/* JOIN PLACEHOLDER */}
      <section className="join-section">
        <div className="join-content">
          <h2>Join the Campus Community</h2>
          <p>Don't miss out on what's happening around campus. Create an account today to start registering for events, syncing with your calendar, and connecting with peers!</p>

          <button
            className="cta-button"
            onClick={() => navigate("/register")}
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* MODAL */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        onRegister={handleRegister}
        onShare={handleShare}
        loading={registerLoadingId === selectedEvent?.id}
      />
    </div>
  );
}
