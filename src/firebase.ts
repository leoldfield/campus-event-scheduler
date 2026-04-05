import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "./dataconnect-generated"; // Default output directory for the Data Connect SDK
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function getDataConnectClient() {
	return getDataConnect(app, connectorConfig);
}

function getProjectIdFromToken(idToken: string) {
	try {
		const parts = String(idToken || "").split(".");
		if (parts.length < 2) {
			return "";
		}

		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
		const payload = JSON.parse(atob(padded));
		return String(payload?.aud || "");
	} catch {
		return "";
	}
}

export async function ensureUserSession() {
	await auth.authStateReady();

	const user = auth.currentUser;
	if (!user || user.isAnonymous) {
		throw new Error("You must log in with your account before performing this action.");
	}

	const token = await user.getIdToken(true);
	const tokenProjectId = getProjectIdFromToken(token);

	if (tokenProjectId && tokenProjectId !== firebaseConfig.projectId) {
		await signOut(auth);
		throw new Error("Your session belongs to a different Firebase project. Please log in again.");
	}

	return user;
}