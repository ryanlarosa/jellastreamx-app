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
import { servers, getMovieStreamUrl } from "../api/vidsrc";
import {
  addToWatchlist,
  removeFromWatchlist,
  isMediaInWatchlist,
  WatchlistItem,
  updateWatchHistory,
  WatchHistoryItem,
} from "../api/firestore";

import { useAuth } from "../context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import ServerSelectionModal from "../components/ServerSelectionModal";
import MediaDetailsLayout from "../components/MediaDetailsLayout";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";
const CAST_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";

type DetailsScreenRouteProp = RouteProp<RootStackParamList, "Details">;

type Props = {
  route: DetailsScreenRouteProp;
};

export default function DetailsScreen({ route }: Props) {
  const { movieId } = route.params;
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);

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

  const handlePlay = (server: { getUrl: Function }) => {
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
      const streamUrl = getMovieStreamUrl(movie.id, server);
      navigation.navigate("Player", { streamUrl, title: movie.title });
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user || user === "guest" || !movie) {
      Alert.alert(
        "Guests cannot save items",
        "Please sign in to use this feature."
      );
      return;
    }
    const mediaItem: WatchlistItem = {
      id: movie.id,
      poster_path: movie.poster_path,
      title: movie.title,
      media_type: "movie",
    };
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(user.uid, mediaItem);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(user.uid, mediaItem);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      Alert.alert("Error", "Could not update your watchlist.");
    }
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
              onPress={() => setIsServerModalVisible(true)}
            >
              <Ionicons name="play" size={24} color="black" />
              <Text style={styles.playButtonText}>Play</Text>
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
        {/* No extra children needed for the movie screen, so pass an empty view */}
        <View />
      </MediaDetailsLayout>

      <ServerSelectionModal
        isVisible={isServerModalVisible}
        servers={servers}
        onClose={() => setIsServerModalVisible(false)}
        onSelectServer={handlePlay}
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
