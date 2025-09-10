import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import { fetchAppConfig } from "../api/remoteConfig"; // Import the new function

export default function UpdateRequiredScreen() {
  const [updateUrl, setUpdateUrl] = useState("");

  // Fetch the latest config when the screen loads
  useEffect(() => {
    const getConfig = async () => {
      const config = await fetchAppConfig();
      if (config && config.latest_apk_url) {
        setUpdateUrl(config.latest_apk_url);
      }
    };
    getConfig();
  }, []);

  const handleUpdate = () => {
    if (updateUrl) {
      Linking.openURL(updateUrl);
    } else {
      Alert.alert(
        "Update URL not found",
        "Please contact support to get the latest version."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Update Required</Text>
      <Text style={styles.message}>
        A new version of JellaStreamX is available. Please update the app to
        continue.
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Update Now"
          onPress={handleUpdate}
          color="#E50914"
          disabled={!updateUrl}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  message: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: { width: "80%" },
});
