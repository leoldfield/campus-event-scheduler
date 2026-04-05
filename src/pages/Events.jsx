import React, { useEffect, useState } from "react";
import { getFirstNameById, listEvents } from "../dataconnect-generated";
import { getDataConnectClient } from "../firebase";

export default function Events() {
  const [firstName, setFirstName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    // UUID must be in canonical 8-4-4-4-12 format.
    const staticUserId = "574d80c8-8f16-4637-919d-7edd8b69d09c";

    getFirstNameById(getDataConnectClient(), { id: staticUserId })
      .then(({ data }) => {
        if (!data.userList?.firstname) {
          setNameError("No user found for the configured static ID.");
          return;
        }

        setFirstName(data.userList.firstname);
      })
      .catch((error) => {
        console.error("Failed to load user name", error);
        setNameError(error?.message || "Failed to load user name.");
      })
      .finally(() => {
        setLoadingName(false);
      });
  }, []);

  useEffect(() => {
    listEvents(getDataConnectClient())
      .then(({ data }) => {
        const fetchedEvents = data?.eventLists || [];
        setEvents(fetchedEvents);
      })
      .catch((error) => {
        console.error("Failed to load events", error);
        setEventsError(error?.message || "Failed to load events.");
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, []);

  const formatEventDate = (timestamp) => {
    const eventDate = new Date(timestamp);
    if (Number.isNaN(eventDate.getTime())) {
      return "Invalid date";
    }

    return eventDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <h1>UA Little Rock Campus Events</h1>
      <h2>
        Welcome
        {loadingName ? "..." : ""}
        {!loadingName && firstName ? `, ${firstName}` : ""}
      </h2>
      {nameError ? <p style={{ color: "#b00020" }}>{nameError}</p> : null}
      <p>Find upcoming University of Arkansas at Little Rock events and register easily.</p>

      {loadingEvents ? <p>Loading events...</p> : null}
      {eventsError ? <p style={{ color: "#b00020" }}>{eventsError}</p> : null}

      <div className="grid">
        {events.map((event) => (
          <div className="card" key={event.id}>
            <h2>{event.eventname}</h2>
            <p><strong>Start:</strong> {formatEventDate(event.starttime)}</p>
            <p><strong>End:</strong> {formatEventDate(event.endtime)}</p>
            <p><strong>Location:</strong> {event.location || "TBD"}</p>
            <p>{event.eventdesc}</p>
            <button className="button">Register</button>
          </div>
        ))}
      </div>

      {!loadingEvents && !eventsError && events.length === 0 ? (
        <p>No events are available right now.</p>
      ) : null}
    </div>
  );
}