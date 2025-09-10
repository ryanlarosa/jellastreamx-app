import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  useNavigation,
  RouteProp,
  useIsFocused,
} from "@react-navigation/native";
import { getTvShowDetails, getCredits } from "../api/tmdb";
import { servers, getTvStreamUrl } from "../api/vidsrc";
import {
  addToWatchlist,
  removeFromWatchlist,
  isMediaInWatchlist,
  WatchlistItem,
  updateWatchHistory,
  WatchHistoryItem,
  getShowWatchHistory,
} from "../api/firestore";
import { useAuth } from "../context/AuthContext";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import ServerSelectionModal from "../components/ServerSelectionModal";
import MediaDetailsLayout from "../components/MediaDetailsLayout";

type TvDetailsScreenRouteProp = RouteProp<RootStackParamList, "TvDetails">;
type Props = { route: TvDetailsScreenRouteProp };

export default function TvDetailsScreen({ route }: Props) {
  const { tvId } = route.params;
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [tvShow, setTvShow] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<
    number | null
  >(null);
  const [lastWatched, setLastWatched] = useState<WatchHistoryItem | null>(null);
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      const [details, castData] = await Promise.all([
        getTvShowDetails(tvId),
        getCredits("tv", tvId),
      ]);

      if (!details) {
        setLoading(false);
        setTvShow(null);
        return;
      }

      setTvShow(details);
      setCast(castData.slice(0, 10));

      let history = null;
      if (user && user !== "guest") {
        const [fetchedHistory, inList] = await Promise.all([
          getShowWatchHistory(user.uid, tvId),
          isMediaInWatchlist(user.uid, tvId),
        ]);
        history = fetchedHistory;
        setLastWatched(history);
        setIsInWatchlist(inList);
      }

      if (details.seasons && details.seasons.length > 0) {
        if (history && history.seasonNumber) {
          setSelectedSeasonNumber(history.seasonNumber);
        } else {
          const initialSeason =
            details.seasons.find(
              (s: any) => s.season_number === 1 && s.episode_count > 0
            ) || details.seasons.find((s: any) => s.episode_count > 0);
          if (initialSeason) {
            setSelectedSeasonNumber(initialSeason.season_number);
          }
        }
      }
      setLoading(false);
    };

    if (isFocused) {
      fetchAllData();
    }
  }, [tvId, user, isFocused]);

  const selectedSeason = tvShow?.seasons.find(
    (season: any) => season.season_number === selectedSeasonNumber
  );

  const handlePlayEpisode = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    setIsServerModalVisible(true);
  };

  const handleServerSelection = (server: { getUrl: Function }) => {
    if (tvShow && selectedSeason && selectedEpisode) {
      if (user && user !== "guest") {
        const historyItem: WatchHistoryItem = {
          id: tvShow.id,
          media_type: "tv",
          name: tvShow.name,
          poster_path: tvShow.poster_path,
          seasonNumber: selectedSeason.season_number,
          episodeNumber: selectedEpisode,
          lastWatchedAt: Date.now(),
        };
        updateWatchHistory(user.uid, historyItem);
      }
      const streamUrl = getTvStreamUrl(
        tvShow.id,
        selectedSeason.season_number,
        selectedEpisode,
        server
      );
      const title = `${tvShow.name} - S${selectedSeason.season_number} E${selectedEpisode}`;
      navigation.navigate("Player", { streamUrl, title });
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user || user === "guest" || !tvShow) {
      Alert.alert(
        "Guests cannot save items",
        "Please sign in to use this feature."
      );
      return;
    }

    const mediaItem: WatchlistItem = {
      id: tvShow.id,
      poster_path: tvShow.poster_path,
      name: tvShow.name,
      media_type: "tv",
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

  if (!tvShow) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Show details not found.</Text>
      </SafeAreaView>
    );
  }
  return (
    <>
      <MediaDetailsLayout
        media={tvShow}
        cast={cast}
        actionButtons={
          <View style={styles.actionButtonsContainer}>
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
        {/* The unique Seasons and Episodes section is passed as children */}
        <View style={styles.seasonsContainer}>
          <Text style={styles.sectionTitle}>Seasons</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tvShow.seasons &&
              tvShow.seasons.map(
                (season: any) =>
                  season.episode_count > 0 && (
                    <TouchableOpacity
                      key={season.id}
                      style={[
                        styles.seasonButton,
                        selectedSeasonNumber === season.season_number &&
                          styles.selectedSeasonButton,
                      ]}
                      onPress={() =>
                        setSelectedSeasonNumber(season.season_number)
                      }
                    >
                      <Text style={styles.seasonButtonText}>{season.name}</Text>
                    </TouchableOpacity>
                  )
              )}
          </ScrollView>

          <Text style={styles.episodesTitle}>Episodes</Text>
          {selectedSeason &&
            Array.from(
              { length: selectedSeason.episode_count },
              (_, i) => i + 1
            ).map((episodeNum) => {
              const isLastWatched =
                lastWatched &&
                lastWatched.seasonNumber === selectedSeason.season_number &&
                lastWatched.episodeNumber === episodeNum;
              return (
                <TouchableOpacity
                  key={episodeNum}
                  style={[
                    styles.episodeContainer,
                    isLastWatched && styles.lastWatchedEpisode,
                  ]}
                  onPress={() => handlePlayEpisode(episodeNum)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {isLastWatched && (
                      <Ionicons
                        name="eye-outline"
                        size={18}
                        color="#E50914"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text style={styles.episodeText}>Episode {episodeNum}</Text>
                  </View>
                  <Ionicons
                    name="play-circle-outline"
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>
              );
            })}
        </View>
      </MediaDetailsLayout>

      <ServerSelectionModal
        isVisible={isServerModalVisible}
        servers={servers}
        onClose={() => setIsServerModalVisible(false)}
        onSelectServer={handleServerSelection}
      />
    </>
  );
}

// Styles for only the unique elements of this screen
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
  actionButtonsContainer: { flexDirection: "row", alignItems: "center" },
  myListButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(50,50,50,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontSize: 12, marginTop: 4 },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  seasonsContainer: { marginTop: 30 },
  seasonButton: {
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedSeasonButton: { backgroundColor: "#E50914" },
  seasonButtonText: { color: "white", fontSize: 16 },
  episodesTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
  },
  episodeContainer: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  episodeText: { color: "white", fontSize: 16 },
  lastWatchedEpisode: {
    backgroundColor: "#444",
    borderColor: "#E50914",
    borderWidth: 1,
  },
});
