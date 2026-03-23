import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "./dataconnect-generated"; // Default output directory for the Data Connect SDK
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dataConnect = getDataConnect(app, connectorConfig);