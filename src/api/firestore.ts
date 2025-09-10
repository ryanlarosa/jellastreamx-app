import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  FieldValue, // 1. Import FieldValue
  deleteField, // Import deleteField for modern SDKs
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebaseConfig";

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Define the shape of a watchlist item for type safety
export interface WatchlistItem {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path: string;
}

// Function to add a media item to a user's watchlist
export const addToWatchlist = async (
  userId: string,
  mediaItem: WatchlistItem
) => {
  const watchlistRef = doc(db, "watchlists", userId);
  try {
    // 'arrayUnion' safely adds an item to an array field, avoiding duplicates
    await updateDoc(watchlistRef, {
      items: arrayUnion(mediaItem),
    });
  } catch (error: any) {
    // If the document doesn't exist, create it
    if (error.code === "not-found") {
      await setDoc(watchlistRef, { items: [mediaItem] });
    } else {
      console.error("Error adding to watchlist: ", error);
      throw error;
    }
  }
};

// Function to remove a media item from a user's watchlist
export const removeFromWatchlist = async (
  userId: string,
  mediaItem: WatchlistItem
) => {
  const watchlistRef = doc(db, "watchlists", userId);
  // 'arrayRemove' safely removes all instances of an item from an array field
  await updateDoc(watchlistRef, {
    items: arrayRemove(mediaItem),
  });
};

// Function to get a user's entire watchlist
export const getWatchlist = async (
  userId: string
): Promise<WatchlistItem[]> => {
  const watchlistRef = doc(db, "watchlists", userId);
  const docSnap = await getDoc(watchlistRef);

  if (docSnap.exists()) {
    return docSnap.data().items as WatchlistItem[];
  } else {
    // If the user has no watchlist yet, return an empty array
    return [];
  }
};

// Function to check if a specific item is already in the user's watchlist
export const isMediaInWatchlist = async (
  userId: string,
  mediaId: number
): Promise<boolean> => {
  const watchlist = await getWatchlist(userId);
  return watchlist.some((item) => item.id === mediaId);
};

// --- START OF NEW CODE ---
// Define the shape of a watch history item
export interface WatchHistoryItem {
  id: number;
  media_type: "movie" | "tv"; // Now accepts 'movie'
  title?: string;
  name?: string;
  poster_path: string;
  seasonNumber?: number; // Optional
  episodeNumber?: number; // Optional
  lastWatchedAt: number;
}
// --- START OF FIX ---

// Function to save or update a user's watch progress for a specific show
export const updateWatchHistory = async (
  userId: string,
  historyItem: WatchHistoryItem
) => {
  const historyRef = doc(db, "watchHistory", userId);
  try {
    // 1. Get the existing document
    const docSnap = await getDoc(historyRef);
    let existingShows = {};
    if (docSnap.exists() && docSnap.data().shows) {
      existingShows = docSnap.data().shows;
    }

    // 2. Update the specific show's data in the map
    const updatedShows = {
      ...existingShows,
      [historyItem.id]: historyItem,
    };

    // 3. Write the entire 'shows' map back to the document
    await setDoc(historyRef, { shows: updatedShows }, { merge: true });
  } catch (error) {
    console.error("Error updating watch history: ", error);
    throw error;
  }
};

// This function is now correct and will work with the data saved by the new updateWatchHistory
export const getWatchHistory = async (
  userId: string
): Promise<WatchHistoryItem[]> => {
  const historyRef = doc(db, "watchHistory", userId);
  const docSnap = await getDoc(historyRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data && data.shows) {
      const historyArray = Object.values(data.shows) as WatchHistoryItem[];
      historyArray.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
      return historyArray;
    }
  }
  return [];
};

export const getShowWatchHistory = async (
  userId: string,
  tvId: number
): Promise<WatchHistoryItem | null> => {
  const historyRef = doc(db, "watchHistory", userId);
  const docSnap = await getDoc(historyRef);

  if (docSnap.exists() && docSnap.data().shows && docSnap.data().shows[tvId]) {
    return docSnap.data().shows[tvId] as WatchHistoryItem;
  }
  return null; // Return null if no history exists for this specific show
};

export const removeFromWatchHistory = async (
  userId: string,
  mediaId: number
) => {
  const historyRef = doc(db, "watchHistory", userId);
  try {
    // We use dot notation with deleteField() to remove a specific key from the 'shows' map
    await updateDoc(historyRef, {
      [`shows.${mediaId}`]: deleteField(),
    });
  } catch (error) {
    console.error("Error removing from watch history: ", error);
    throw error;
  }
};
