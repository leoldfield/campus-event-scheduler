import React from "react";

export default function Events() {
  const sampleEvents = [
    {
      id: 1,
      title: "School of Business Career Fair",
      date: "March 12, 2026",
      location: "Donaghey Student Center",
      description: "Meet employers, explore internships, and connect with business professionals."
    },
    {
      id: 2,
      title: "Trojan Forge Town Hall",
      date: "March 11, 2026",
      location: "EIT Building",
      description: "A campus discussion event focused on student ideas, innovation, and collaboration."
    },
    {
      id: 3,
      title: "Campus Garden Volunteer Day",
      date: "March 6, 2026",
      location: "Ottenheimer Library",
      description: "Join fellow students and volunteers for a campus community service activity."
    },
    {
      id: 4,
      title: "School of Education Career Fair",
      date: "March 13, 2026",
      location: "Donaghey Student Center",
      description: "Learn about career opportunities, and prepare for future teaching roles."
    }
  ];

  return (
    <div>
      <h1>UA Little Rock Campus Events</h1>
      <p>Find upcoming University of Arkansas at Little Rock events and register easily.</p>

      <div className="grid">
        {sampleEvents.map((event) => (
          <div className="card" key={event.id}>
            <h2>{event.title}</h2>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p>{event.description}</p>
            <button className="button">Register</button>
          </div>
        ))}
      </div>
    </div>
  );
}