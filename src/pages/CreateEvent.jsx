import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createEvent } from "../dataconnect-generated";
import { ensureUserSession, getDataConnectClient } from "../firebase";
import "../css/CreateEvent.css";

export default function CreateEvent() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const editingEvent = locationState.state?.event || null;

  const formatForDateTimeInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 16);
  };

  // STEP STATE
  const [step, setStep] = useState(1);

  // FORM STATE
  const [eventName, setEventName] = useState(editingEvent?.eventname || "");
  const [location, setLocation] = useState(editingEvent?.location || "");
  const [eventDescription, setEventDescription] = useState(editingEvent?.eventdesc || "");
  const [startTime, setStartTime] = useState(formatForDateTimeInput(editingEvent?.starttime));
  const [endTime, setEndTime] = useState(formatForDateTimeInput(editingEvent?.endtime));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const nextStep = () => {
    setError("");

    // Step validation
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

  // FINAL SUBMIT (Step 3 only)
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const coordinatorId = normalizeUuid(localStorage.getItem("loggedInUserId"));
    if (!uuidPattern.test(coordinatorId)) {
      setError("You must be logged in to create an event.");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

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

      if (lastError) throw lastError;

      setSuccessMessage(
        editingEvent
          ? "Event form loaded for editing. Update function still needs backend connection."
          : "Event created successfully. Redirecting..."
      );

      setTimeout(() => navigate("/"), 700);
    } catch (createError) {
      console.error("Create event failed", createError);
      setError(createError?.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapSrc = location
    ? `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
    : null;

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    return date.toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <div className="create-event-wrapper">
      <div className="create-event-card">

        <h1>{editingEvent ? "Edit Event" : "Create Event"}</h1>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <p>Step {step} of 3</p>

        <div className='form-report'>
          {error && <p style={{ color: "#b00020" }}>{error}</p>}
          {successMessage && <p style={{ color: "#0b6b2f" }}>{successMessage}</p>}
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="form-step">
              <h2>Basic Info</h2>

              <input
                className="input"
                placeholder="Event title"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />

              <textarea
                className="input"
                placeholder="Event description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                rows={5}
              />

              <button type="button" className="stepButtonNext" onClick={nextStep}>
                Next
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="form-step">
              <h2>Time & Location</h2>

              <input
                className="input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />

              <input
                className="input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />

              <input
                className="input"
                placeholder="Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              {mapSrc && (
                  <iframe
                    src={mapSrc}
                    style={{
                      border: 0,
                      width: "100%",
                      height: "200px",
                      borderRadius: "8px",
                    }}
                    loading="lazy"
                    title="Event Location Map"
                  />
              )}

              <div className="step-buttons">
                <button type="button" className="stepButtonBack" onClick={prevStep}>Back</button>
                <button type="button" className="stepButtonNext" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="form-step">
              <h2>Review</h2>

              <div className="review-item">
                <span className="review-label">Name</span>
                <span className="review-value">{eventName}</span>
              </div>

              <div className="review-item">
                <span className="review-label">Description</span>
                <span className="review-value">{eventDescription}</span>
              </div>

              <div className="review-item">
                <span className="review-label">Start</span>
                <span className="review-value">{formatDate(startTime)}</span>
              </div>

              <div className="review-item">
                <span className="review-label">End</span>
                <span className="review-value">{formatDate(endTime)}</span>
              </div>

              <div className="review-item">
                <span className="review-label">Location</span>
                <span className="review-value">{location}</span>
              </div>

              <div className="step-buttons">
                <button type="button" className="stepButtonBack" onClick={prevStep}>Back</button>
                <button className="button" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingEvent
                      ? "Updating..."
                      : "Creating..."
                    : editingEvent
                    ? "Update Event"
                    : "Create Event"}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}