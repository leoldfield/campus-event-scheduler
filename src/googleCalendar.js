const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/calendar.events";

let tokenClient = null;
let googleAccessToken = null;
let tokenExpiresAt = 0;

const ensureGoogleClientId = () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Missing environment variable VITE_GOOGLE_CLIENT_ID. Add a Google OAuth client ID to your Vite env."
    );
  }
};

const loadGsiScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Identity Services can only be loaded in the browser."));
      return;
    }

    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.querySelector("script[src='https://accounts.google.com/gsi/client']");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.body.appendChild(script);
  });
};

const ensureTokenClient = async () => {
  if (tokenClient) {
    return tokenClient;
  }

  ensureGoogleClientId();
  await loadGsiScript();

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GOOGLE_SCOPE,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.warn("Google token request failed", tokenResponse);
        return;
      }

      googleAccessToken = tokenResponse.access_token;
      tokenExpiresAt = Date.now() + (Number(tokenResponse.expires_in || 3600) * 1000) - 10_000;
    },
  });

  return tokenClient;
};


export function hasValidToken() {
  return !!googleAccessToken && Date.now() < tokenExpiresAt;
}


const requestAccessToken = async ({ prompt = "consent" } = {}) => {
  ensureGoogleClientId();
  const client = await ensureTokenClient();

  if (hasValidToken()) {
    return googleAccessToken;
  }

  return new Promise((resolve, reject) => {
    //Google Auth timeout
    const timeout = setTimeout(() => {
      reject(new Error("Google Authorization timed out. Please check if popups are blocked."));
    }, 60000);  

    client.callback = (tokenResponse) => {
      clearTimeout(timeout);
      if (tokenResponse.error) {
        reject(new Error(tokenResponse.error_description || tokenResponse.error));
        return;
      }

      googleAccessToken = tokenResponse.access_token;
      tokenExpiresAt = Date.now() + (Number(tokenResponse.expires_in || 3600) * 1000) - 10_000;
      resolve(googleAccessToken);
    };

    try {
      client.requestAccessToken({ prompt });
    } catch (err) {
      clearTimeout(timeout);
      reject(new Error("Failed to open Google Authorization window."));
    }
  });
};

const normalizeCalendarId = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-v0-9-]/g, "")
    .slice(0, 100);
};


const buildCalendarEventId = (eventId, userIdOrEmail) => {
  const normalizedUser = normalizeCalendarId(userIdOrEmail);
  const normalizedEvent = normalizeCalendarId(eventId);
  return `ces${normalizedUser}${normalizedEvent}`;
};

const toCalendarDateTime = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid event date: ${isoString}`);
  }

  return {
    dateTime: date.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
};

export async function requestGoogleCalendarAccess() {
  await requestAccessToken({ prompt: "consent" });
}


export async function createGoogleCalendarEvent(event, user) {
  const accessToken = await requestAccessToken({ prompt: "" });
  
  const eventId = buildCalendarEventId(normalizeCalendarId(event.id), normalizeCalendarId(user.uid || user.email || "unknown"));
  
  const body = {
    id: eventId,
    summary: event.eventname || "Campus Event",
    description: `${event.eventdesc || ""}\n\nRegistered via Campus Event Scheduler`,
    location: event.location || undefined,
    start: toCalendarDateTime(event.starttime),
    end: toCalendarDateTime(event.endtime),
    attendees: user.email ? [{ email: user.email }] : undefined,
    // Explicitly set status to confirmed to "revive" it if it was cancelled
    status: "confirmed", 
  };

  // 1. Attempt to create the event (POST)
  let response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // 2. If 409 Conflict, it means the ID exists (likely cancelled). Update it instead (PUT).
  if (response.status === 409) {
    const updateUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ID: ${eventId} | Google API: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function deleteGoogleCalendarEvent(event, user) {
  const accessToken = await requestAccessToken({ prompt: "none" });

  const eventId = buildCalendarEventId(normalizeCalendarId(event.id), normalizeCalendarId(user.uid || user.email || "unknown"));
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok || response.status === 404 || response.status === 410) {
    return;
  }

  const errorText = await response.text();
  throw new Error(`Google Calendar event deletion failed: ${response.status} ${errorText}`);
}
