import Constants from "expo-constants";
import { FIREBASE_DB_URL } from "@env";

// This is the ONLY exported function from this file.
export const fetchAppConfig = async () => {
  try {
    const response = await fetch(FIREBASE_DB_URL);
    if (!response.ok) {
      console.error(
        "Failed to fetch app config, status:",
        response.status,
        await response.text()
      );
      return null;
    }
    const data = await response.json();
    console.log("Fetched app config from Realtime DB:", data);
    return data;
  } catch (error) {
    console.error("Error fetching app config:", error);
    return null;
  }
};
