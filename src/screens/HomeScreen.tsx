import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  getTrendingMovies,
  getPopularMovies,
  getTrendingTvShows,
  getPopularAnime,
} from "../api/tmdb";
import {
  getWatchHistory,
  removeFromWatchHistory,
  WatchHistoryItem,
} from "../api/firestore";
import { useAuth } from "../context/AuthContext";
import VideoCarousel from "../components/VideoCarousel";
import CarouselSkeleton from "../components/CarouselSkeleton";
import { Movie, TVShow } from "../types/api";

// Define a type for our media state for clarity
interface MediaState {
  trendingMovies: Movie[];
  trendingTvShows: TVShow[];
  popularMovies: Movie[];
  popularAnime: TVShow[];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [media, setMedia] = useState<MediaState>({
    trendingMovies: [],
    trendingTvShows: [],
    popularMovies: [],
    popularAnime: [],
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // This single, robust useEffect handles all data fetching
  useEffect(() => {
    const fetchAllMedia = async () => {
      setLoading(true);
      try {
        // --- START OF FIX #2 ---
        // 3. Define the promises array with a broad type to allow different kinds of promises
        const promises: Promise<any>[] = [
          getTrendingMovies(),
          getPopularMovies(),
          getTrendingTvShows(),
          getPopularAnime(),
        ];
        if (user && user !== "guest") {
          promises.push(getWatchHistory(user.uid));
        }
        const results = await Promise.all(promises);
        // 4. Safely assign the results using their index
        setMedia({
          trendingMovies: results[0] || [],
          popularMovies: results[1] || [],
          trendingTvShows: results[2] || [],
          popularAnime: results[3] || [],
        });
        if (user && user !== "guest") {
          // The watch history is the 5th item (index 4)
          setWatchHistory(results[4] || []);
        } else {
          setWatchHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch media for home screen:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) {
      fetchAllMedia();
    }
  }, [user, isFocused]);

  const handleRemoveFromHistory = (itemToRemove: WatchHistoryItem) => {
    if (!user || user === "guest") return;

    // --- START OF FIX #1 ---
    // Use the correct property for the name (title for movies, name for TV)
    const displayName = itemToRemove.title || itemToRemove.name;
    // --- END OF FIX #1 ---

    Alert.alert(
      "Remove from Continue Watching",
      `Are you sure you want to remove "${displayName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            setWatchHistory((currentHistory) =>
              currentHistory.filter((item) => item.id !== itemToRemove.id)
            );
            try {
              await removeFromWatchHistory(user.uid, itemToRemove.id);
            } catch (error) {
              console.error("Failed to remove item from history:", error);
              Alert.alert(
                "Error",
                "Could not remove the item from your history."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <CarouselSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {watchHistory.length > 0 && (
          <VideoCarousel
            title="Continue Watching"
            data={watchHistory}
            onLongPressItem={handleRemoveFromHistory}
            // --- START OF FIX #2 ---
            // The hardcoded mediaType prop has been removed.
            // The carousel is now smart enough to handle mixed content.
            // --- END OF FIX #2 ---
          />
        )}
        <VideoCarousel
          title="Trending Movies"
          data={media.trendingMovies}
          mediaType="movie"
        />
        <VideoCarousel
          title="Trending TV Shows"
          data={media.trendingTvShows}
          mediaType="tv"
        />
        <VideoCarousel
          title="Popular Anime"
          data={media.popularAnime}
          mediaType="tv"
        />
        <VideoCarousel
          title="Popular Movies"
          data={media.popularMovies}
          mediaType="movie"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  scrollContent: { paddingTop: 10 },
});
