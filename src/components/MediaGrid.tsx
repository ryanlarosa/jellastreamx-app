import React from "react";
import { StyleSheet, FlatList, Dimensions, View } from "react-native";
import MediaItem from "./MediaItem";
import { Movie, TVShow } from "../types/api";
import { WatchlistItem } from "../api/firestore";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../navigation/types";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const ITEM_MARGIN = 16;
const ITEM_WIDTH = (width - (NUM_COLUMNS + 1) * ITEM_MARGIN) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5 + 40;

interface MediaGridProps {
  data: (Movie | TVShow | WatchlistItem)[];
  onLongPressItem?: (item: WatchlistItem) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ data, onLongPressItem }) => {
  const navigation = useNavigation<AppNavigationProp>();

  const handleItemPress = (item: any) => {
    if (item.media_type === "movie" || item.title) {
      navigation.navigate("Details", { movieId: item.id });
    } else {
      navigation.navigate("TvDetails", { tvId: item.id });
    }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        // --- START OF FIX ---
        // The extra TouchableOpacity has been removed.
        // We now pass the handlers directly to the MediaItem.
        <MediaItem
          item={item}
          onPress={handleItemPress} // Pass the navigation handler
          onLongPress={onLongPressItem} // Pass the long-press handler
          showTitle={true}
          style={styles.itemContainer}
        />
        // --- END OF FIX ---
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    alignItems: "center", // Center the grid content
    paddingHorizontal: ITEM_MARGIN / 2,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginHorizontal: ITEM_MARGIN / 2,
    marginBottom: ITEM_MARGIN,
  },
});

export default MediaGrid;
