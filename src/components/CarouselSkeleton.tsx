import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import SkeletonPlaceholder from "./SkeletonPlaceholder";

const CarouselSkeleton = () => {
  // Create a dummy array to render a few placeholders
  const placeholders = [1, 2, 3];

  return (
    <View style={styles.container}>
      {/* This is a placeholder for the carousel's title */}
      <View style={styles.titlePlaceholder} />

      {/* This is the horizontal list of poster placeholders */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {placeholders.map((p) => (
          <View key={p} style={styles.itemWrapper}>
            <SkeletonPlaceholder />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30, // Space between skeleton carousels
    marginTop: 10,
  },
  titlePlaceholder: {
    width: 180,
    height: 20,
    backgroundColor: "#222", // Dark placeholder color
    borderRadius: 5,
    marginLeft: 15,
    marginBottom: 15,
  },
  list: {
    paddingLeft: 15,
  },
  itemWrapper: {
    marginRight: 10,
  },
});

export default CarouselSkeleton;
