import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createEvent, updateEvent } from "../dataconnect-generated";
import { auth, ensureUserSession, getDataConnectClient } from "../firebase";
import "../css/CreateEvent.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import EventCard from "./Components/EventCard";
import { useEventContext } from "./EventContext.jsx";

export default function CreateEvent() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const editingEvent = locationState.state?.event || null;

  const eventContext = useEventContext();
  const refreshEvents = eventContext?.refreshEvents;
  const addEventLocal = eventContext?.addEventLocal;
  const dbUserId = eventContext?.dbUserId;
  const addNotification = eventContext?.addNotification;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editingEvent?.imageUrl || "");

  // =========================
  // HELPERS
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Creates a local preview URL
    }
  };

  const formatForDateTimeInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  // =========================
  // GOOGLE GEOCODER
  // =========================
  const getCoordinates = async (locationString) => {
    if (!locationString) return null;

    // Pull the API key from your environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // ✅ FIX: If the API key is missing, return the campus fallback instead of null!
    if (!apiKey) {
      console.warn("Google Maps API key is missing from .env file! Defaulting to campus center.");
      return { lat: 34.722, lng: -92.339 };
    }

    // We append the city/state to give Google a hint
    const query = `${locationString}, Little Rock, AR`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      // Google returns "OK" if it successfully found a match
      if (data.status === "OK" && data.results.length > 0) {
        const exactLocation = data.results[0].geometry.location;
        return {
          lat: exactLocation.lat,
          lng: exactLocation.lng
        };
      }

      // Fallback: If Google somehow can't find it, default to the center of campus
      console.warn(`Google could not find "${locationString}". Status: ${data.status}`);
      return { lat: 34.722, lng: -92.339 };

    } catch (err) {
      console.error("Google Geocoding failed:", err);
      // Fallback to campus center on network error
      return { lat: 34.722, lng: -92.339 };
    }
  };

  // =========================
  // STATE
  // =========================
  const [step, setStep] = useState(1);

  const [eventName, setEventName] = useState(editingEvent?.eventname || "");
  const [location, setLocation] = useState(editingEvent?.location || "");
  const [eventDescription, setEventDescription] = useState(
    editingEvent?.eventdesc || ""
  );
  const [imageUrl, setImageUrl] = useState(editingEvent?.imageUrl || "");
  const [startTime, setStartTime] = useState(
    formatForDateTimeInput(editingEvent?.starttime)
  );
  const [endTime, setEndTime] = useState(
    formatForDateTimeInput(editingEvent?.endtime)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [category, setCategory] = useState(editingEvent?.category || "social");
  const CATEGORIES = ["academic", "social", "sports", "arts", "technology", "career"];

  // =========================
  // STEP NAVIGATION
  // =========================
  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (!eventName.trim() || !eventDescription.trim()) {
        setError("Please fill out all fields.");
        return;
      }
    }

    if (step === 2) {
      if (!location.trim() || !startTime || !endTime) {
        setError("Please complete all fields.");
        return;
      }

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (endDate <= startDate) {
        setError("End time must be later than start time.");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!auth.currentUser) {
      setError("You must be logged in.");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    setIsSubmitting(true);

    try {
      await ensureUserSession();
      let finalImageUrl = editingEvent?.imageUrl || "";

      // 1. Fetch coordinates using the 'location' state directly
      if (imageFile) {
        const storage = getStorage();
        // Creates a unique filename
        const storageRef = ref(storage, `event_banners/${crypto.randomUUID()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }
      const coords = await getCoordinates(location);

      if (editingEvent) {
        // ✅ UPDATE PAYLOAD (Does NOT include eventcoord)
        const updatePayload = {
          id: editingEvent.id || crypto.randomUUID,
          eventname: eventName.trim(),
          location: location.trim(),
          eventdesc: eventDescription.trim(),
          starttime: startDate.toISOString(),
          endtime: endDate.toISOString(),
          lat: coords ? coords.lat : null,
          lng: coords ? coords.lng : null,
          imageUrl: finalImageUrl,
          category: category,
        };

        // Optimistic UI update & Database update
        eventContext?.updateEventLocal?.(updatePayload);
        await updateEvent(getDataConnectClient(), updatePayload);

        if (addNotification) {
          addNotification({
            type: "success",
            title: "Event Updated!",
            message: "Your event has been successfully updated."
          });
        }

      } else {
        // ✅ CREATE PAYLOAD (Includes eventcoord)
        const createPayload = {
          id: crypto.randomUUID(),
          eventcoord: dbUserId, // Only needed for new events
          eventname: eventName.trim(),
          location: location.trim(),
          eventdesc: eventDescription.trim(),
          starttime: startDate.toISOString(),
          endtime: endDate.toISOString(),
          lat: coords ? coords.lat : null,
          lng: coords ? coords.lng : null,
          imageUrl: finalImageUrl,
          category: category,
        };

        addEventLocal?.(createPayload);

        await createEvent(getDataConnectClient(), createPayload);

        if (addNotification) {
          addNotification({ 
            type: "success", 
            title: "Event Created!", 
            message: "Your event has been successfully published." 
          });
        }
      }

      // ✅ CENTRALIZED SYNC
      await refreshEvents?.();
      setTimeout(() => {
        window.location.href = "/";
      }, 500)
    } catch (err) {
      console.error("Submit failed", err);
      if (addNotification) {
        addNotification({ 
          type: "error", 
          title: "Error", 
          message: "Something went wrong saving the event." 
        });}
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // MAP
  // =========================
  const mapSrc = location
    ? `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
    : null;

  const previewEvent = {
    id: "preview",
    eventname: eventName || "Your Event Title",
    eventdesc: eventDescription || "Your event description will appear here.",
    starttime: startTime || new Date().toISOString(),
    endtime: endTime || new Date().toISOString(),
    location: location || "Event Location",
    imageUrl: imagePreview,
    category: category,
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="create-event-wrapper">
      <div className={`create-event-card ${step === 3 ? "wide-card" : ""}`}>
        <h1>{editingEvent ? "Edit Event" : "Create Event"}</h1>

        {/* PROGRESS BAR */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
        <p style={{ marginTop: "12px" }}>Step {step} of 3</p>

        {/* MESSAGES */}
        <div className="form-report">
          {error && <p style={{ color: "#b00020", marginTop: "10px" }}>{error}</p>}
          {successMessage && (
            <p style={{ color: "#0b6b2f", marginTop: "10px" }}>{successMessage}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="form-step">
              <h2>Basic Info</h2>
              <input className="input" placeholder="Event title" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              <textarea className="input" placeholder="Event description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
              <div className="category-selection-wrapper">
                <label className="category-label">Event Category</label>
                <div className="category-pills">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      // Dynamically apply the 'active' class if selected
                      className={`category-pill-btn ${category === cat ? "active" : ""}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="image-upload-wrapper">
                <label className="image-upload-box">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="banner-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span style={{ fontSize: "30px", marginBottom: "8px" }}>📸</span>
                      <p>Click to upload event banner</p>
                    </div>
                  )}
                  {/* Hidden file input triggered by clicking the label */}
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              </div>

              <div className="step-buttons" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="stepButtonNext" onClick={nextStep}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="form-step">
              <h2>Time & Location</h2>
              <input className="input" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <input className="input" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <input className="input" placeholder="Address (e.g., Donaghey Student Center)" value={location} onChange={(e) => setLocation(e.target.value)} />

              {mapSrc && (
                <iframe src={mapSrc} style={{ border: 0, width: "100%", height: "200px", borderRadius: "8px", marginTop: "8px" }} loading="lazy" title="Event Location Map" />
              )}

              <div className="step-buttons">
                <button type="button" className="stepButtonBack" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="stepButtonNext" onClick={nextStep}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="form-step review-step-container">

              {/* LEFT SIDE: Review Details */}
              <div className="review-details">
                <h2>Review & Submit</h2>

                <div className="review-item">
                  <span className="review-label">Name</span>
                  <span className="review-value">{eventName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Description</span>
                  <span className="review-value">{eventDescription}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Start Time</span>
                  <span className="review-value">{formatDate(startTime)}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">End Time</span>
                  <span className="review-value">{formatDate(endTime)}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Location</span>
                  <span className="review-value">{location}</span>
                </div>

                <div className="step-buttons">
                  <button type="button" className="stepButtonBack" onClick={prevStep}>
                    Back
                  </button>
                  <button className="stepButtonNext" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (editingEvent ? "Updating..." : "Creating...") : (editingEvent ? "Update Event" : "Create Event")}
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: Live Card Preview */}
              <div className="review-preview">
                <h2>Card Preview</h2>
                <EventCard event={previewEvent} showRegister={true} />
              </div>

            </div>
          )}
        </form>
      </div>
    </div>
  );
}