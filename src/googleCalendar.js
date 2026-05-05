const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/calendar.events";


let tokenClient = null;
let googleAccessToken = null;
let tokenExpiresAt = 0;

// Queue for handling multiple token requests sequentially
let tokenRequestQueue = [];

// Flag to indicate if Google Calendar integration is enabled.
// This is set to false if VITE_GOOGLE_CLIENT_ID is missing.
let isGoogleCalendarIntegrationEnabled = true;

const ensureGoogleClientId = () => {
  if (!GOOGLE_CLIENT_ID) {
    console.error(
      "Google Calendar integration is disabled: Missing VITE_GOOGLE_CLIENT_ID. " +
      "Please ensure this environment variable is set during your Vite build process."
    );
    isGoogleCalendarIntegrationEnabled = false;
  }
};

// Call this once when the module loads to perform the initial check.
ensureGoogleClientId();

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
  if (!isGoogleCalendarIntegrationEnabled) {
    throw new Error("Google Calendar integration is disabled due to missing client ID.");
  }
  if (tokenClient) {
    return tokenClient;
  }

  ensureGoogleClientId();
  await loadGsiScript();

  const handleTokenResponse = (tokenResponse) => {
    const request = tokenRequestQueue.shift();
    if (!request) return;

    if (tokenResponse.error) {
      const error = new Error(tokenResponse.error_description || tokenResponse.error);
      error.code = tokenResponse.error;
      request.reject(error);
      return;
    }

    googleAccessToken = tokenResponse.access_token;
    tokenExpiresAt = Date.now() + (Number(tokenResponse.expires_in || 3600) * 1000) - 10_000;
    request.resolve(googleAccessToken);
  };

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GOOGLE_SCOPE,
    callback: handleTokenResponse,
  });

  return tokenClient;
};


export function hasValidToken() {
  return !!googleAccessToken && Date.now() < tokenExpiresAt;
}


const requestAccessToken = async ({ prompt = "consent" } = {}) => {
  if (!isGoogleCalendarIntegrationEnabled) {
    throw new Error("Google Calendar integration is disabled due to missing client ID.");
  }
  const client = await ensureTokenClient();

  if (hasValidToken() && tokenRequestQueue.length === 0) {
    return googleAccessToken;
  }

  return new Promise((resolve, reject) => {
    tokenRequestQueue.push({ resolve, reject });

    if (tokenRequestQueue.length === 1) {
      client.requestAccessToken({ prompt });
    }
  }).catch(async (err) => {
    if (
      prompt === "none" &&
      (err.code === "interaction_required" || err.code === "user_logged_out")
    ) {
      // Added small delay to account for race conditions
      await new Promise((resolve) => setTimeout(resolve, 50));
      return requestAccessToken({ prompt: "consent" });
    } else {
      throw err;
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
  const accessToken = await requestAccessToken({ prompt: "none" });
  
  const eventId = buildCalendarEventId(normalizeCalendarId(event.id), normalizeCalendarId(user.uid || user.email || "unknown"));
  
  const body = {
    id: eventId,
    summary: event.eventname || "Campus Event",
    description: `${event.eventdesc || ""}\n\nRegistered via Campus Event Scheduler`,
    location: event.location || undefined,
    start: toCalendarDateTime(event.starttime),
    end: toCalendarDateTime(event.endtime),
    attendees: user.email ? [{ email: user.email }] : undefined,
    status: "confirmed", 
  };

  const insertUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events`;
  let response;
  try {
    response = await fetch(insertUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 409) {
      const updateUrl = `${insertUrl}/${eventId}`;
      response = await fetch(updateUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
  } catch (err) {
    throw new Error(`Google Calendar API request failed: ${err.message}`);
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
