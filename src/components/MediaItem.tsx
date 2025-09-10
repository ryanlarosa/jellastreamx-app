import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface MediaItemProps {
  item: {
    id: number;
    poster_path: string | null;
    title?: string;
    name?: string;
  };
  onPress: (item: any) => void; // Expects the full item
  onLongPress?: (item: any) => void; // Expects the full item
  showTitle?: boolean;
  style?: object;
}

const MediaItem: React.FC<MediaItemProps> = ({
  item,
  onPress,
  onLongPress,
  showTitle = false,
  style,
}) => {
  const title = item.title || item.name;

  const imageSource = item.poster_path
    ? { uri: `${IMAGE_BASE_URL}${item.poster_path}` }
    : require("../../assets/placeholder.png");

  return (
    // This is now the single source of truth for all touch events
    <TouchableOpacity
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress && onLongPress(item)}
      style={[styles.wrapper, style]}
    >
      <View style={styles.posterContainer}>
        <Image source={imageSource} style={styles.poster} />
      </View>
      {showTitle && title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "transparent" },
  posterContainer: {
    width: "100%",
    height: "85%",
    borderRadius: 10,
    backgroundColor: "#333",
    overflow: "hidden",
  },
  poster: { width: "100%", height: "100%", resizeMode: "cover" },
  titleContainer: {
    height: "15%",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  title: { color: "white", fontSize: 12, textAlign: "left" },
});

export default MediaItem;
