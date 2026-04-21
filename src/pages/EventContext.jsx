import React, { createContext, useContext, useState } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());

  return (
    <EventContext.Provider value={{ registeredEventIds, setRegisteredEventIds }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext);
}