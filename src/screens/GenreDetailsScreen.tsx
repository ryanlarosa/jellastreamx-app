import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity, // 1. Import TouchableOpacity for the button
  Platform,
  StatusBar,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native"; // 2. Import useNavigation
import { RootStackParamList, AppNavigationProp } from "../navigation/types";
import { discoverMediaByGenre } from "../api/tmdb";
import MediaGrid from "../components/MediaGrid";
import Ionicons from "@expo/vector-icons/Ionicons"; // 3. Import icons

type GenreDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "GenreDetails"
>;

const GenreDetailsScreen = () => {
  const route = useRoute<GenreDetailsScreenRouteProp>();
  const navigation = useNavigation<AppNavigationProp>(); // 4. Get the navigation object
  const { genreId, genreName } = route.params;

  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const results = await discoverMediaByGenre(genreId);
      setMedia(results);
      setLoading(false);
    };
    fetchMedia();
  }, [genreId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{genreName}</Text>
      <MediaGrid data={media} />

      {/* 5. Add the floating back button, just like in your other details screens */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    // Add padding to account for the status bar, since we have no header
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20, // Give some space below the status bar
    marginBottom: 10,
    textAlign: "center",
  },
  // 6. Add the style for the back button
  backButton: {
    position: "absolute",
    top: (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0) + 15,
    left: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
});

export default GenreDetailsScreen;
