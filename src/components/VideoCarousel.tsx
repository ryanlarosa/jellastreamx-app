import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MediaItem from "./MediaItem";
import { AppNavigationProp } from "../navigation/types";
import { WatchHistoryItem } from "../api/firestore"; // Import the type for clarity

interface VideoCarouselProps {
  title: string;
  data: any[]; // This can be movies, tv shows, or watch history
  mediaType?: "movie" | "tv";
  onLongPressItem?: (item: any) => void; // 1. Add the new optional prop
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({
  title,
  data,
  mediaType, // This is now optional
  onLongPressItem,
}) => {
  const navigation = useNavigation<AppNavigationProp>();

  // --- START OF FIX ---
  // This function is now smarter. It looks at the item's own media_type.
  const handleItemPress = (item: any) => {
    const type = item.media_type || mediaType; // Use the item's type, or fall back to the prop

    if (type === "movie") {
      navigation.navigate("Details", { movieId: item.id });
    } else if (type === "tv") {
      navigation.navigate("TvDetails", { tvId: item.id });
    }
  };
  // --- END OF FIX ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <MediaItem
              item={item}
              onPress={() => handleItemPress(item)}
              // 3. Pass the onLongPress handler down to the MediaItem
              onLongPress={onLongPressItem}
              style={{ width: 140, height: 210 }}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 15,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 15,
  },
  itemWrapper: {
    marginRight: 10,
  },
});

export default VideoCarousel;
