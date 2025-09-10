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

export default function SignUpScreen() {
  const { signUpWithEmail } = useAuth();
  const navigation = useNavigation<AppNavigationProp>();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
      // The onAuthStateChanged listener in AuthContext will handle navigation
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
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
        placeholder="Your Name"
        placeholderTextColor="#888"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
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
        placeholder="Password (6+ characters)"
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
          <Button
            title="Create Account"
            onPress={handleSignUp}
            color="#E50914"
          />
        </View>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        disabled={loading}
      >
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
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
  linkText: {
    color: "gray",
    marginTop: 20,
    fontSize: 16,
  },
});
