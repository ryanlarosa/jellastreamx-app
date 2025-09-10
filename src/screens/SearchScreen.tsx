import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { searchMedia, getGenres } from "../api/tmdb";
import MediaGrid from "../components/MediaGrid"; // We use our reusable grid
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../navigation/types";
import { Genre, Movie, TVShow } from "../types/api";
import _ from "lodash";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const navigation = useNavigation<AppNavigationProp>();

  // This useEffect fetches the list of genres when the screen first loads
  useEffect(() => {
    const fetchGenres = async () => {
      const genreList = await getGenres();
      // We can filter out genres that might not be relevant if we want
      setGenres(genreList);
    };
    fetchGenres();
  }, []); // Empty array ensures this runs only once

  // This is your existing debounced search function
  const debouncedSearch = useCallback(
    _.debounce(async (searchQuery: string) => {
      if (searchQuery.length > 2) {
        setLoading(true);
        const media = await searchMedia(searchQuery);
        setResults(media);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // This function handles navigation when a user taps a genre tag
  const handleGenrePress = (genre: Genre) => {
    navigation.navigate("GenreDetails", {
      genreId: genre.id,
      genreName: genre.name,
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator size="large" color="#E50914" style={styles.loader} />
      );
    }

    // If the user is actively searching...
    if (query.length > 2) {
      // And there are results, show the grid.
      if (results.length > 0) {
        return <MediaGrid data={results} />;
      }
      // If there are no results, show a message.
      return (
        <Text style={styles.placeholderText}>
          No results found for "{query}"
        </Text>
      );
    }

    // If the user is not searching, show the genre list.
    return (
      <ScrollView>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.genreContainer}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={styles.genreTag}
              onPress={() => handleGenrePress(genre)}
            >
              <Text style={styles.genreText}>{genre.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for movies, TV shows, anime..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
      />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414" },
  searchBar: {
    backgroundColor: "#222",
    color: "white",
    fontSize: 16,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  loader: {
    marginTop: 50,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    margin: 15,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows tags to wrap to the next line
    paddingHorizontal: 10,
    justifyContent: "center", // Center the tags
  },
  genreTag: {
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  genreText: {
    color: "#ccc",
    fontSize: 14,
  },
  placeholderText: {
    color: "#888",
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
  },
});
