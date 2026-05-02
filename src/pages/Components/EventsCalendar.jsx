import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { useEventContext } from "../EventContext.jsx";
import EventModal from "./EventModal"; 
import "../../css/EventsCalendar.css"; 

export default function EventsCalendar() {
  const navigate = useNavigate();
  const { events, registerForEvent, dbUserId } = useEventContext();
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const mainCalendarRef = useRef(null);

  const CATEGORY_COLORS = {
    Academic: { bg: "#e0f2fe", text: "#0284c7" },
    Social: { bg: "#fef08a", text: "#a16207" },
    Sports: { bg: "#dcfce7", text: "#16a34a" },
    Arts: { bg: "#f3e8ff", text: "#9333ea" },
    Technology: { bg: "#e2e8f0", text: "#475569" },
    Career: { bg: "#ffedd5", text: "#ea580c" }
  };

  const calendarEvents = events.map((event) => {
    const colors = CATEGORY_COLORS[event.category] || { bg: "#fee2e2", text: "#991b1b" };
    return {
      id: event.id,
      title: event.eventname,
      start: event.starttime,
      end: event.endtime,
      backgroundColor: colors.bg,
      borderColor: colors.bg, 
      textColor: colors.text,
      extendedProps: { ...event },
    };
  });

  const handleEventClick = (clickInfo) => {
    const originalEvent = clickInfo.event.extendedProps;
    setSelectedEvent(originalEvent);
  };

  const handleMiniDateClick = (info) => {
    if (mainCalendarRef.current) {
      const calendarApi = mainCalendarRef.current.getApi();
      calendarApi.gotoDate(info.date); 
      calendarApi.changeView('timeGridDay'); 
    }
  };

  return (
    <div className="calendar-page-container">
      
      <div className="calendar-page-header">
        <h1>Campus Calendar</h1>
        <p>View all upcoming events at a glance.</p>
      </div>

      <div className="calendar-content-row">
        
        {/* LEFT SIDEBAR */}
        <div className="calendar-sidebar">
          <button className="btn-create-event" onClick={() => navigate("/create")}>
            <span className="plus-icon">+</span> Create
          </button>

          <div className="mini-calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev",
                center: "title",
                right: "next"
              }}
              dateClick={handleMiniDateClick}
              height="auto" 
              contentHeight="auto"
              fixedWeekCount={false} 
            />
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="calendar-main-wrapper">
          <FullCalendar
            ref={mainCalendarRef} 
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="100%" 
            dayMaxEvents={true}
          />
        </div>

      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={registerForEvent}
          isRegistered={false} 
        />
      )}
    </div>
  );
}