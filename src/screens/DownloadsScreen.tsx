import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function DownloadsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Downloads Screen</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "white" },
});
