import React, { useEffect, useState, useMemo } from "react";
import {
  findUserByEmail,
  getUserByFirebaseUid,
  updateUserProfile,
} from "../dataconnect-generated";
import { auth, getDataConnectClient } from "../firebase";
import { requestGoogleCalendarAccess } from "../googleCalendar";
import { useEventContext } from "./EventContext.jsx";
import "../css/UserProfile.css";

// Category definitions for Top Interests styling
const CATEGORIES = [
  { id: 1, name: "Academic", icon: "📚", color: "#e0f2fe", text: "#0284c7" },
  { id: 2, name: "Social", icon: "🎉", color: "#fef08a", text: "#a16207" },
  { id: 3, name: "Sports", icon: "🏆", color: "#dcfce7", text: "#16a34a" },
  { id: 4, name: "Arts", icon: "🎨", color: "#f3e8ff", text: "#9333ea" },
  { id: 5, name: "Technology", icon: "💻", color: "#e2e8f0", text: "#475569" },
  { id: 6, name: "Career", icon: "💼", color: "#ffedd5", text: "#ea580c" }
];

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileId, setProfileId] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    age: "",
    major: "",
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [authorizingCalendar, setAuthorizingCalendar] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // === FETCH GLOBAL EVENT DATA ===
  const { events, registeredEventIds, dbUserId } = useEventContext();

  // === CALCULATE DYNAMIC DASHBOARD STATS ===
  // === CALCULATE DYNAMIC DASHBOARD STATS ===
  const userStats = useMemo(() => {
    const now = new Date();
    let upcomingCount = 0;
    let attendedCount = 0;
    let hostedCount = 0;
    const categoryTallies = {};

    // SAFETY NET 1: Default to empty arrays while Firebase is loading
    const safeEvents = events || [];

    // SAFETY NET 2: Handle both Arrays and Sets, and protect against null
    const safeRegisteredIds = Array.isArray(registeredEventIds)
      ? registeredEventIds
      : (registeredEventIds instanceof Set ? Array.from(registeredEventIds) : []);

    // 1. Filter out only the events this user is registered for
    const myRegisteredEvents = safeEvents.filter((e) => safeRegisteredIds.includes(e.id));

    // 2. Tally up Attended, Upcoming, and Categories
    myRegisteredEvents.forEach((e) => {
      if (new Date(e.endtime) < now) {
        attendedCount++;
      } else {
        upcomingCount++;
      }

      if (e.category) {
        categoryTallies[e.category] = (categoryTallies[e.category] || 0) + 1;
      }
    });

    // 3. Count Hosted Events (where user is the creator)
    safeEvents.forEach((e) => {
      if (e.eventcoord === dbUserId) {
        hostedCount++;
      }
    });

    // 4. Calculate Top Interests
    const sortedInterests = Object.entries(categoryTallies)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency (highest first)
      .slice(0, 3) // Take top 3
      .map(([catName]) => {
        return CATEGORIES.find(c => c.name.toLowerCase() === catName.toLowerCase())
          || { name: catName, icon: "📌", color: "#f3f4f6", text: "#374151" };
      });

    // 5. Award Badges Based on Stats
    const badges = [];
    if (attendedCount >= 10) badges.push({ icon: "🦋", name: "Social Butterfly", desc: "Attended 10+ Events" });
    else if (attendedCount >= 5) badges.push({ icon: "🌟", name: "Rising Star", desc: "Attended 5+ Events" });
    else badges.push({ icon: "🌱", name: "Newcomer", desc: "Welcome to Campus!" });

    if (hostedCount >= 3) badges.push({ icon: "👑", name: "Event Leader", desc: "Hosted 3+ Events" });
    else if (hostedCount >= 1) badges.push({ icon: "🎤", name: "Host", desc: "Hosted an Event" });

    if (upcomingCount >= 3) badges.push({ icon: "📅", name: "Planner", desc: "3+ Upcoming RSVPs" });

    // Show max 4 badges so UI doesn't break
    return {
      upcoming: upcomingCount,
      attended: attendedCount,
      hosted: hostedCount,
      topInterests: sortedInterests,
      badges: badges.slice(0, 4)
    };
  }, [events, registeredEventIds, dbUserId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser || currentUser.isAnonymous) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      setSuccessMessage("");
      try {
        let matchedUser = null;
        try {
          const uidResult = await getUserByFirebaseUid(getDataConnectClient(), { firebaseUid: currentUser.uid });
          matchedUser = uidResult.data?.userLists?.[0] || null;
        } catch (uidError) {
          console.warn("User not found by firebase uid, trying email fallback", uidError);
        }
        if (!matchedUser && currentUser.email) {
          const emailResult = await findUserByEmail(getDataConnectClient(), { email: currentUser.email.toLowerCase() });
          matchedUser = emailResult.data?.userLists?.[0] || null;
        }
        if (!matchedUser) {
          setError("Could not find your profile.");
          setLoading(false);
          return;
        }
        setProfileId(matchedUser.id);
        setFormData({
          firstname: matchedUser.firstname || "",
          lastname: matchedUser.lastname || "",
          email: matchedUser.email || currentUser.email || "",
          age: matchedUser.age != null ? String(matchedUser.age) : "",
          major: matchedUser.major || "",
        });
      } catch (loadError) {
        console.error("Failed to load profile", loadError);
        setError(loadError?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthorizeCalendar = async () => {
    setCalendarError("");
    setCalendarMessage("");
    if (!currentUser || currentUser.isAnonymous) {
      setCalendarError("Please log in to enable Google Calendar access.");
      return;
    }
    setAuthorizingCalendar(true);
    try {
      await requestGoogleCalendarAccess();
      setCalendarMessage("Google Calendar access granted. Your events can now sync.");
    } catch (authError) {
      console.error("Calendar authorization failed", authError);
      setCalendarError(authError?.message || "Google Calendar authorization failed.");
    } finally {
      setAuthorizingCalendar(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!currentUser || currentUser.isAnonymous) {
      setError("Please log in to edit your profile.");
      return;
    }
    if (!profileId || !formData.firstname.trim() || !formData.lastname.trim() || !formData.age.trim() || !formData.major.trim()) {
      setError("Please fill out all editable fields.");
      return;
    }
    const parsedAge = Number.parseInt(formData.age, 10);
    if (Number.isNaN(parsedAge) || parsedAge < 0) {
      setError("Please enter a valid age.");
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(getDataConnectClient(), {
        id: profileId,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        age: parsedAge,
        major: formData.major.trim(),
      });
      setSuccessMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (saveError) {
      console.error("Failed to update profile", saveError);
      setError(saveError?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: "center" }}><h2>Loading profile...</h2></div>
      </div>
    );
  }

  if (!currentUser || currentUser.isAnonymous) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: "center" }}><h2>Please log in to view your profile.</h2></div>
      </div>
    );
  }

  const userInitials = `${formData.firstname?.[0] || ""}${formData.lastname?.[0] || ""}`.toUpperCase() || "U";
  const dynamicAvatarUrl = `https://ui-avatars.com/api/?name=${userInitials}&background=ca1e4c&color=fff&bold=true&size=150`;

  return (
    <div className="profile-page">
      {!isEditing ? (
        <div className="profile-container">
          {/* ================= LEFT COLUMN ================= */}
          <div className="left-column">
            <div className="card profile-card">
              <img src={dynamicAvatarUrl} alt="Profile" className="profile-img" />
              <h2 className="profile-name">
                {formData.firstname} {formData.lastname}
              </h2>
              <p className="profile-subtitle">{formData.major || "Undeclared Major"}</p>
              <p className="profile-description">Active Campus Member</p>

              <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
                <button className="btn btn-outline" onClick={handleAuthorizeCalendar} disabled={authorizingCalendar}>
                  {authorizingCalendar ? "Syncing..." : "Sync Calendar"}
                </button>
              </div>
              {calendarError && <p style={{ color: "crimson", marginTop: "15px", fontSize: "14px" }}>{calendarError}</p>}
              {calendarMessage && <p style={{ color: "green", marginTop: "15px", fontSize: "14px" }}>{calendarMessage}</p>}
            </div>

            <div className="card">
              <h3 className="section-title">Personal Information</h3>
              <table className="info-table">
                <tbody>
                  <tr><td>Email</td><td>{formData.email}</td></tr>
                  <tr><td>Age</td><td>{formData.age || "Not specified"}</td></tr>
                  <tr><td>Major</td><td>{formData.major || "Not specified"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="right-column">

            <div className="card">
              <h3 className="section-title">Campus Activity</h3>
              <div className="activity-stats-grid">
                <div className="activity-stat-box">
                  <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>📅</div>
                  <span className="stat-number">{userStats.upcoming}</span>
                  <span className="stat-label">Upcoming</span>
                </div>
                <div className="activity-stat-box">
                  <div className="stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>✅</div>
                  <span className="stat-number">{userStats.attended}</span>
                  <span className="stat-label">Attended</span>
                </div>
                <div className="activity-stat-box">
                  <div className="stat-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>🎤</div>
                  <span className="stat-number">{userStats.hosted}</span>
                  <span className="stat-label">Hosted</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Interests & Achievements</h3>

              <h4 className="subsection-title">Top Interests</h4>
              <div className="interests-container">
                {userStats.topInterests.length > 0 ? (
                  userStats.topInterests.map((cat, idx) => (
                    <span
                      key={idx}
                      className="interest-pill"
                      style={{ background: cat.color, color: cat.text }}
                    >
                      {cat.icon} {cat.name}
                    </span>
                  ))
                ) : (
                  <span className="interest-pill" style={{ background: "#f3f4f6", color: "#374151" }}>
                    Register for events to see interests!
                  </span>
                )}
              </div>

              <h4 className="subsection-title" style={{ marginTop: "24px" }}>Recent Badges</h4>
              <div className="badges-container">
                {userStats.badges.map((badge, idx) => (
                  <div className="badge-item" key={idx}>
                    <div className="badge-icon">{badge.icon}</div>
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-desc">{badge.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      ) : (
        /* ================= EDIT PROFILE MODE ================= */
        <div className="profile-form card" style={{ maxWidth: "700px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ color: "#6E2639", margin: 0 }}>Edit Profile Settings</h2>
            <button className="btn btn-outline" style={{ padding: "8px 16px", minWidth: "auto" }} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
          <p style={{ color: "#666", marginBottom: "20px" }}>Update your personal details below.</p>

          {error && <p style={{ color: "crimson" }}>{error}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstname" style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444" }}>First Name</label>
                <input id="firstname" name="firstname" type="text" value={formData.firstname} onChange={handleChange} className="form-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="lastname" style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444" }}>Last Name</label>
                <input id="lastname" name="lastname" type="text" value={formData.lastname} onChange={handleChange} className="form-input" />
              </div>
            </div>
            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444" }}>Email (Read Only)</label>
              <input id="email" name="email" type="email" value={formData.email} readOnly className="form-input read-only" />
            </div>
            <div>
              <label htmlFor="age" style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444" }}>Age</label>
              <input id="age" name="age" type="number" min="0" value={formData.age} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label htmlFor="major" style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#444" }}>Major</label>
              <input id="major" name="major" type="text" value={formData.major} onChange={handleChange} className="form-input" />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: "10px", padding: "14px" }}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}