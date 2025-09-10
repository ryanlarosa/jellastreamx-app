import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../navigation/types";

export default function LoginScreen() {
  const { loginAsGuest, signInWithEmail } = useAuth();
  const navigation = useNavigation<AppNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        "Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#E50914"
          style={{ marginVertical: 10 }}
        />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Sign In" onPress={handleSignIn} color="#E50914" />
        </View>
      )}

      {/* --- START OF CHANGE --- */}
      {/* Replaced the Sign Up button with a text link */}
      <TouchableOpacity
        onPress={() => navigation.navigate("SignUp")}
        disabled={loading}
      >
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      {/* --- END OF CHANGE --- */}

      <View style={styles.guestButtonContainer}>
        <Button
          title="Continue as Guest"
          onPress={loginAsGuest}
          color="#555"
          disabled={loading}
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
    paddingHorizontal: 20,
  },
  logo: { width: "80%", height: 100, marginBottom: 40 },
  input: {
    width: "100%",
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 5,
  },
  guestButtonContainer: {
    width: "100%",
    marginTop: 20,
  },
  linkText: {
    color: "gray",
    marginTop: 20,
    fontSize: 16,
  },
});
