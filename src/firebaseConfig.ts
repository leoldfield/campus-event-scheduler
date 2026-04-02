interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing VITE_FIREBASE_API_KEY. Add it to your .env.local file and restart the Vite dev server."
  );
}

export const firebaseConfig = {
  apiKey,
  authDomain: "campus-event-scheduler-79008.firebaseapp.com",
  projectId: "campus-event-scheduler-79008",
  storageBucket: "campus-event-scheduler-79008.appspot.com",
  messagingSenderId: "1058543242456",
  appId: "1:1058543242456:web:8c8b8b8b8b8b8b8b8b8b8b",
  measurementId: "G-1234567890"
};
