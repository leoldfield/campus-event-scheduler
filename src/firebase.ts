import { initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "./dataconnect-generated"; // Default output directory for the Data Connect SDK
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const dataConnect = getDataConnect(app, connectorConfig);