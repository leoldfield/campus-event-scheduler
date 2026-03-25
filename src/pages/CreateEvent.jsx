import React from "react";
import "./CreateEvent.css";

export default function CreateEvent() {
  return (
    <div className="create-page">
      <div className="create-wrapper">
        <div className="create-left-accent"></div>

        <div className="create-card">
          <h1>Create Event</h1>
          <p>Event creation form (placeholder).</p>

          <label>Title</label>
          <input type="text" placeholder="event title" />

          <label>Date</label>
          <input type="date" />

          <label>Description</label>
          <textarea placeholder="event description" rows="4"></textarea>

          <button>Create</button>
        </div>
      </div>
    </div>
  );
}