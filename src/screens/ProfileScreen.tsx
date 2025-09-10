// src/screens/ProfileScreen.tsx
import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // Handle the case where the user is a guest
  if (user === "guest") {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.displayName}>Guest User</Text>
        <Text style={styles.email}>Sign in to save your watchlist.</Text>
        <View style={styles.buttonContainer}>
          <Button title="Logout" onPress={logout} color="#E50914" />
        </View>
      </SafeAreaView>
    );
  }

  // Handle the case where there is no user (shouldn't happen if logic is correct)
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {user.photoURL && (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      )}
      <Text style={styles.displayName}>
        {user.displayName || "No name provided"}
      </Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={logout} color="#E50914" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    alignItems: "center",
    paddingTop: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  displayName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
    fontSize: 16,
    marginBottom: 30,
  },
  buttonContainer: {
    width: "60%",
  },
});
