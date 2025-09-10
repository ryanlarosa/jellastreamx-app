import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  getWatchlist,
  removeFromWatchlist,
  WatchlistItem,
} from "../api/firestore";
import MediaGrid from "../components/MediaGrid"; // 1. Import our new MediaGrid
import { useIsFocused } from "@react-navigation/native";

export default function MyListScreen() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchWatchlist = async () => {
    if (user && user !== "guest") {
      setLoading(true);
      const items = await getWatchlist(user.uid);
      setWatchlist(items.reverse());
      setLoading(false);
    } else {
      setWatchlist([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchWatchlist();
    }
  }, [user, isFocused]);

  const handleLongPress = (item: WatchlistItem) => {
    if (!user || user === "guest") return;

    Alert.alert(
      "Remove from My List",
      `Are you sure you want to remove "${item.title || item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            setWatchlist((currentList) =>
              currentList.filter((w) => w.id !== item.id)
            );
            try {
              await removeFromWatchlist(user.uid, item);
            } catch (error) {
              console.error("Failed to remove item:", error);
              Alert.alert("Error", "Could not remove the item from your list.");
              // Revert the UI if the database operation fails
              fetchWatchlist();
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </SafeAreaView>
    );
  }

  if (!user || user === "guest") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <Text style={styles.headerTitle}>My List</Text>
          <Text style={styles.placeholderText}>
            Please sign in to save and view items in your list.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>My List</Text>
      {watchlist.length > 0 ? (
        // 2. The entire FlatList is replaced by our clean, reusable component
        <MediaGrid data={watchlist} onLongPressItem={handleLongPress} />
      ) : (
        <Text style={styles.placeholderText}>
          Your list is empty. Add movies and shows by tapping the '+' icon on
          their details page.
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  placeholderText: {
    color: "#888",
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    paddingHorizontal: 20,
  },
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
