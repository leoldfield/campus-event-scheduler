import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useEventContext } from "./EventContext.jsx";
import EventCard from "./Components/EventCard";
import EventModal from "./Components/EventModal";

import "../css/Events.css";
import "../css/EventModal.css";

import pencil from "../assets/edit-pencil.png";

import peopleBanner1 from "../assets/PeopleBanner1.png";
import peopleBanner2 from "../assets/PeopleBanner2.png";

// =========================
// CATEGORY DATA FOR CARDS
// =========================
const CATEGORIES = [
  { id: 1, name: "Academic", icon: "📚", },
  { id: 2, name: "Social", icon: "🎉", },
  { id: 3, name: "Sports", icon: "🏆", },
  { id: 4, name: "Arts", icon: "🎨", },
  { id: 5, name: "Technology", icon: "💻", },
  { id: 6, name: "Career", icon: "💼", }
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
    loadingEvents,
    eventsError,
  } = useEventContext();

  // =========================
  // UI STATE
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [registerLoadingId, setRegisterLoadingId] = useState(null);
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [selectedEventId, setSelectedEventId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState("");

  const isSignedInUser = Boolean(currentUser && !currentUser.isAnonymous);
  const [visibleCount, setVisibleCount] = useState(8); // Shows 2 rows of 4 initially
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // =========================
  // EVENTS
  // =========================
  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  // Add this inside Events.jsx to catch shared links
  useEffect(() => {
    // Look at the URL for "?eventId=..."
    const searchParams = new URLSearchParams(window.location.search);
    const sharedEventId = searchParams.get("eventId");

    // If there is an ID in the URL, and our events have finished loading...
    if (sharedEventId && events.length > 0) {
      // Make sure the event actually exists in our database
      const eventToOpen = events.find(e => e.id === sharedEventId);
      if (eventToOpen) {
        setSelectedEventId(sharedEventId);

        // Optional: Clean up the URL so it doesn't stay there if they close the modal
        window.history.replaceState(null, '', '/');
      }
    }
  }, [events]); // Re-run this check once the 'events' array is populated from Firebase

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

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
        setNameError("");
      } catch (err) {
        setNameError(err.message);
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

    try {
      await registerForEvent(eventId, currentUser);

      setSelectedEventId(null);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // SHARE
  // =========================
  const handleShare = async (event) => {
    const shareUrl = `${window.location.origin}/?eventId=${event.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.eventname,
          text: `Check out ${event.eventname} on Campus Events!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback for Desktop: Copy link to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert("Event link copied to clipboard!");
      // (If you have a toast notification system, use that instead of alert!)
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (eventToEdit) => {
    navigate("/create", { state: { event: eventToEdit } });
  };

  // =========================
  // FILTER OPTIONS
  // =========================
  const uniqueLocations = useMemo(() => {
    return [...new Set(events.map((e) => e.location).filter(Boolean))];
  }, [events]);

  // =========================
  // FILTERED EVENTS
  // =========================
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

      // --- ADD THIS NEW CATEGORY CHECK ---
      const matchesCategory =
        selectedCategory === "all" ||
        (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());

      // --- ADD matchesCategory TO THE RETURN STATEMENT ---
      return matchesSearch && matchesLocation && matchesStatus && matchesCategory;
    });
  }, [events, searchTerm, selectedLocation, selectedStatus, selectedCategory, registeredEventIds]);

  const handleCategoryClick = (categoryName) => {
    const lowerCat = categoryName.toLowerCase();
    // Toggle off if they click the same category, otherwise set it
    setSelectedCategory((prev) => (prev === lowerCat ? "all" : lowerCat));

    // Smooth scroll down to the events feed so they see the results!
    window.scrollTo({ top: 800, behavior: "smooth" });
  };

  // =========================
  // CLEAR FILTERS
  // =========================
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setVisibleCount(8);
    setSelectedCategory("all");
  };

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  // Only slice the events we want to show
  const displayedEvents = filteredEvents.slice(0, visibleCount);

  // Add this helper outside or inside your component
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* HERO / INTRO SECTION */}
      <div className="hero-container">
        <img src={peopleBanner1} alt="Students left" className="hero-side-image" />
        <section className="hero-section">
          <div className="hero-content">
            <h1>UALR Campus Events</h1>
            <p>Find upcoming University of Arkansas at Little Rock events, sync your schedule, and register easily.</p>
            {/* Note: Ensure isSignedInUser, loadingName, and firstName are defined/imported correctly in your component */}
            {isSignedInUser && (
              <h2 className="hero-welcome">
                {getTimeOfDayGreeting()}, {firstName}!
                <p>Ready to see what's happening on campus today?</p>
              </h2>
            )}
          </div>
        </section>
        <img src={peopleBanner2} alt="Students right" className="hero-side-image" />
      </div>
      {/* CATEGORIES SECTION */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Explore by Category</h2>
          <p>Find the perfect events tailored to your interests.</p>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div
                className="category-icon-wrapper"
                style={{ backgroundColor: cat.color, color: cat.text }}
              >
                {cat.icon}
              </div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="events-section" style={{ margin: "40px 0" }}>
        {/* NEW MOBILE HEADER GROUP */}
        <div className="mobile-header-group" style={{ marginBottom: "24px" }}>
          <h2>Upcoming Events</h2>

          {/* This button will ONLY show on mobile screens */}
          <button
            className="filter-toggle-btn mobile-only-btn"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {isFilterOpen ? "Close Filters" : "Filters"}
          </button>
        </div>

        {/* NEW WRAPPER FOR SIDEBAR AND GRID */}
        <div className="events-page-layout">

          {/* LEFT SIDEBAR: EXPANDABLE */}
          <aside className={`filters-sidebar ${isFilterOpen ? "open" : "closed"}`}>
            {isFilterOpen ? (
              <div className="filter-content-wrapper">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: 0, borderBottom: "none", paddingBottom: 0 }}>Filter Events</h3>
                  <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)}>✕</button>
                </div>

                <div className="filter-group">
                  <label>Search</label>
                  <input type="text" className="ua-filter-input" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="filter-group">
                  <label>Location</label>
                  <select
                    className="ua-filter-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="all">All locations</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Time</label>
                  <select
                    className="ua-filter-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <button className="ua-filter-clear" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              < button className="open-filter-tab desktop-only-btn" onClick={() => setIsFilterOpen(true)}>
                <span className="vertical-text">FILTERS</span>
              </button>
            )}
          </aside>

          {/* RIGHT MAIN CONTENT: EVENTS GRID & SEE MORE */}
          <div className="events-main-content">



            {filteredEvents.length === 0 ? (

              /* === ZERO RESULTS EMPTY STATE === */
              <div className="empty-state-wrapper" style={{ marginTop: "40px" }}>
                <div className="empty-state-icon">🔍</div>
                <h2>Nothing here to display!</h2>
                <p>We couldn't find any events matching your current filters. Try selecting a different category or clearing your search to check out something else.</p>
                <button
                  className="empty-state-btn"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </div>

            ) : (

              /* === EVENT GRID === */
              <>
                <div className={`events-grid ${isFilterOpen ? "grid-3" : "grid-4"}`}>
                  {filteredEvents.slice(0, visibleCount).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      currentUser={currentUser}
                      onRegister={handleRegister}
                      onShare={handleShare}
                      onOpen={(evt) => setSelectedEventId(evt.id)}
                      loading={registerLoadingId === event.id}
                      isRegistered={registeredEventIds.has(event.id)}
                      showEdit={String(event.eventcoord).toLowerCase() === String(dbUserId).toLowerCase()}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>

                {/* === BUTTON OR "END OF LIST" TEXT === */}
                {filteredEvents.length > 8 ? (
                  // Show the button if there are more than 8 events total
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
                ) : (
                  // Show a subtle text if there are between 1 and 8 events (meaning no button is needed)
                  <div style={{ textAlign: "center", marginTop: "100px", marginBottom: "-80px" }}>
                    <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "24px" }}>
                      That's all the events for now! Check back later for more.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section >

      {/* HOW IT WORKS PLACEHOLDER */}
      < section className="how-it-works-section" >
        <div className="section-header">
          <h2>How Our App Works</h2>
          <p>Your journey to campus engagement in three simple steps.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Discover Events</h3>
            <p>Browse our directory or use the smart filters to find activities, workshops, and socials that match your interests.</p>
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
      </section >

      {/* JOIN PLACEHOLDER */}
      < section className="join-section" >
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
      </section >

      {/* MODAL */}
      < EventModal
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)
        }
        onRegister={handleRegister}
        onShare={handleShare}
        loading={registerLoadingId === selectedEvent?.id}
      />
    </div >
  );
}