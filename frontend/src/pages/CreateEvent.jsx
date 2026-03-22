import React from "react";

export default function CreateEvent() {
    return (
      <div style={{ padding: 24 }}>
        <h1>Create Event</h1>
        <p>Event creation form (placeholder).</p>
  
        <label>Title</label><br />
        <input placeholder="event title" /><br /><br />
  
        <label>Date</label><br />
        <input type="date" /><br /><br />
  
        <label>Description</label><br />
        <textarea placeholder="event description" /><br /><br />
  
        <button>Create</button>
      </div>
    );
  }
  