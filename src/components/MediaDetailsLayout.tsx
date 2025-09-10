import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AppNavigationProp } from "../navigation/types";
import { Movie, TVShow, CastMember } from "../types/api";
import Ionicons from "@expo/vector-icons/Ionicons";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";
const CAST_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";

interface MediaDetailsLayoutProps {
  media: Movie | TVShow;
  cast: CastMember[];
  actionButtons: React.ReactNode; // A dedicated prop for the buttons in the hero
  children: React.ReactNode; // For the rest of the unique content below
}

const MediaDetailsLayout: React.FC<MediaDetailsLayoutProps> = ({
  media,
  cast,
  actionButtons,
  children,
}) => {
  const navigation = useNavigation<AppNavigationProp>();
  const title = (media as Movie).title || (media as TVShow).name;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ImageBackground
          source={{ uri: `${BACKDROP_BASE_URL}${media.backdrop_path}` }}
          style={styles.backdrop}
        >
          <LinearGradient
            colors={["transparent", "rgba(20,20,20,0.6)", "#141414"]}
            style={styles.gradient}
          >
            <Text style={styles.heroTitle}>{title}</Text>
            {/* --- THE FIX IS HERE: The action buttons are now correctly placed --- */}
            {actionButtons}
          </LinearGradient>
        </ImageBackground>

        <View style={styles.infoContainer}>
          <Text style={styles.overview}>{media.overview}</Text>

          {cast.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((actor) => (
                  <View key={actor.id} style={styles.castContainer}>
                    {actor.profile_path ? (
                      <Image
                        source={{
                          uri: `${CAST_IMAGE_BASE_URL}${actor.profile_path}`,
                        }}
                        style={styles.castImage}
                      />
                    ) : (
                      <View style={styles.castImagePlaceholder}>
                        <Ionicons name="person" size={30} color="#555" />
                      </View>
                    )}
                    <Text style={styles.castName} numberOfLines={2}>
                      {actor.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
          {/* The unique content (like the episode list) is rendered here */}
          {children}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  scrollViewContent: { paddingBottom: 40 },
  backdrop: { width: "100%", height: 450, justifyContent: "flex-end" },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    padding: 20,
  },
  heroTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  infoContainer: { padding: 20, marginTop: -20 },
  overview: { color: "#ccc", fontSize: 16, lineHeight: 24, marginBottom: 20 },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 30,
  },
  backButton: {
    position: "absolute",
    top: (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0) + 15,
    left: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  castContainer: { width: 80, marginRight: 10, alignItems: "center" },
  castImage: { width: 70, height: 70, borderRadius: 35 },
  castImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  castName: { color: "#ccc", fontSize: 12, marginTop: 5, textAlign: "center" },
});

export default MediaDetailsLayout;
