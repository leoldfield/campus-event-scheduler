import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../dataconnect-generated";
import { ensureUserSession, getDataConnectClient } from "../firebase";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const normalizeUuid = (value) => {
    const compactHex = String(value || "").replace(/-/g, "").toLowerCase();
    if (/^[0-9a-f]{32}$/.test(compactHex)) {
      return `${compactHex.slice(0, 8)}-${compactHex.slice(8, 12)}-${compactHex.slice(12, 16)}-${compactHex.slice(16, 20)}-${compactHex.slice(20)}`;
    }

    if (uuidPattern.test(String(value || ""))) {
      return String(value).toLowerCase();
    }

    return "";
  };

  const isUnauthenticatedError = (value) => {
    const message = String(value?.message || "").toUpperCase();
    return (
      value?.status === "UNAUTHENTICATED" ||
      value?.code === "UNAUTHENTICATED" ||
      message.includes("UNAUTHENTICATED") ||
      message.includes("@AUTH REJECTED")
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!eventName.trim() || !location.trim() || !eventDescription.trim() || !startTime || !endTime) {
      setError("Please fill out all event fields.");
      return;
    }

    const coordinatorId = normalizeUuid(localStorage.getItem("loggedInUserId"));
    if (!uuidPattern.test(coordinatorId)) {
      setError("You must be logged in to create an event.");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please enter valid start and end times.");
      return;
    }

    if (endDate <= startDate) {
      setError("End time must be later than start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      const mutationPayload = {
        id: crypto.randomUUID(),
        eventcoord: coordinatorId,
        eventname: eventName.trim(),
        location: location.trim(),
        eventdesc: eventDescription.trim(),
        starttime: startDate.toISOString(),
        endtime: endDate.toISOString(),
      };

      let lastError;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          await ensureUserSession();
          await createEvent(getDataConnectClient(), mutationPayload);
          lastError = null;
          break;
        } catch (attemptError) {
          lastError = attemptError;
          if (attempt === 0 && isUnauthenticatedError(attemptError)) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            continue;
          }
          throw attemptError;
        }
      }

      if (lastError) {
        throw lastError;
      }

      setSuccessMessage("Event created successfully. Redirecting...");
      setEventName("");
      setLocation("");
      setEventDescription("");
      setStartTime("");
      setEndTime("");
      setTimeout(() => navigate("/"), 700);
    } catch (createError) {
      console.error("Create event failed", createError);
      if (createError?.code === "auth/admin-restricted-operation") {
        setError("Firebase anonymous sign-in is disabled for this project. Enable Anonymous in Firebase Authentication > Sign-in method.");
      } else if (isUnauthenticatedError(createError)) {
        setError("Your session is not authenticated. Please log in again and retry.");
      } else {
        setError(createError?.message || "Failed to create event.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ padding: 24 }}>
      <h1>Create Event</h1>
      <p>Create a new event and add it to the event list.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="eventName">Title</label><br />
        <input
          id="eventName"
          className="input"
          placeholder="Event title"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <br /><br />

        <label htmlFor="location">Location</label><br />
        <input
          id="location"
          className="input"
          placeholder="Event location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <br /><br />

        <label htmlFor="startTime">Start Time</label><br />
        <input
          id="startTime"
          className="input"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <br /><br />

        <label htmlFor="endTime">End Time</label><br />
        <input
          id="endTime"
          className="input"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <br /><br />

        <label htmlFor="eventDescription">Description</label><br />
        <textarea
          id="eventDescription"
          className="input"
          placeholder="Event description"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          rows={5}
        />
        <br /><br />

        {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
        {successMessage ? <p style={{ color: "#0b6b2f" }}>{successMessage}</p> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
  