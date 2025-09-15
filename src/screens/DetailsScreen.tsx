import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  RouteProp,
} from "@react-navigation/native";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";
import { getMovieDetails, getCredits } from "../api/tmdb";
import {
  addToWatchlist,
  removeFromWatchlist,
  isMediaInWatchlist,
  WatchlistItem,
  updateWatchHistory,
  WatchHistoryItem,
} from "../api/firestore";
import { resolveStreams, StreamSource } from "../api/streamResolver"; // 1. Import the new resolver
import { useAuth } from "../context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import StreamSelectionModal from "../components/StreamSelectionModal"; // 2. Import the new modal
import MediaDetailsLayout from "../components/MediaDetailsLayout";
import { Movie } from "../types/api";

type Props = {
  route: RouteProp<RootStackParamList, "Details">;
};

export default function DetailsScreen({ route }: Props) {
  const { movieId } = route.params;
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // New state for the resolver flow
  const [isResolving, setIsResolving] = useState(false);
  const [streams, setStreams] = useState<StreamSource[]>([]);
  const [isStreamModalVisible, setIsStreamModalVisible] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const [details, castData] = await Promise.all([
        getMovieDetails(movieId),
        getCredits("movie", movieId),
      ]);

      if (!details) {
        setLoading(false);
        setMovie(null);
        return;
      }

      setMovie(details);
      setCast(castData.slice(0, 10));

      if (user && user !== "guest") {
        const inList = await isMediaInWatchlist(user.uid, movieId);
        setIsInWatchlist(inList);
      }
      setLoading(false);
    };
    if (isFocused) {
      fetchAllData();
    }
  }, [movieId, user, isFocused]);

  // This function is now called by the modal
  const handleSelectStream = (stream: StreamSource) => {
    if (movie) {
      if (user && user !== "guest") {
        const historyItem: WatchHistoryItem = {
          id: movie.id,
          media_type: "movie",
          title: movie.title,
          poster_path: movie.poster_path,
          lastWatchedAt: Date.now(),
        };
        updateWatchHistory(user.uid, historyItem);
      }
      navigation.navigate("Player", {
        streamUrl: stream.url,
        title: movie.title,
      });
    }
  };

  // This function is called by the "Play" button to fetch streams
  const handleResolve = async () => {
    if (!movie) return;
    setIsResolving(true);
    // Pass the title and year to the resolver for a better match
    const releaseYear = movie.release_date
      ? parseInt(movie.release_date.substring(0, 4))
      : undefined;
    const resolvedStreams = await resolveStreams(movie.title, releaseYear);
    setStreams(resolvedStreams);
    setIsResolving(false);

    // Show the modal only if streams were found
    if (resolvedStreams.length > 0) {
      setIsStreamModalVisible(true);
    } else {
      Alert.alert(
        "No Streams Found",
        "Sorry, we couldn't find any playable streams for this movie."
      );
    }
  };

  const handleToggleWatchlist = async () => {
    /* ... (this function is correct) ... */
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Movie details not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <MediaDetailsLayout
        media={movie}
        cast={cast}
        actionButtons={
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handleResolve}
              disabled={isResolving}
            >
              {isResolving ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Ionicons name="play" size={24} color="black" />
                  <Text style={styles.playButtonText}>Play</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.myListButton}
              onPress={handleToggleWatchlist}
            >
              <Ionicons
                name={isInWatchlist ? "checkmark" : "add"}
                size={24}
                color="white"
              />
              <Text style={styles.buttonText}>My List</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {/* No extra children needed for the movie screen */}
        <View />
      </MediaDetailsLayout>

      <StreamSelectionModal
        isVisible={isStreamModalVisible}
        streams={streams}
        onClose={() => setIsStreamModalVisible(false)}
        onSelectStream={handleSelectStream}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { color: "white", fontSize: 16 },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 15,
  },
  playButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  myListButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(50,50,50,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontSize: 12, marginTop: 4 },
});
