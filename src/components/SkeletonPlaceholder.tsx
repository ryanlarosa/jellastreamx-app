import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SkeletonPlaceholder = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // This effect creates a continuous shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200, // Speed of the shimmer
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  // We interpolate the animated value to move the gradient from left to right
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200], // Moves the gradient across the placeholder
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["#222", "#333", "#222"]} // Gradient from dark -> light -> dark
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 210,
    backgroundColor: "#222", // Dark placeholder color
    borderRadius: 10,
    overflow: "hidden", // This is crucial to clip the moving gradient
  },
});

export default SkeletonPlaceholder;
