import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import { fetchAppConfig } from "../api/remoteConfig";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList, MainTabParamList } from "./types";

// Import all necessary screens and components
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MyListScreen from "../screens/MyListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DetailsScreen from "../screens/DetailsScreen";
import TvDetailsScreen from "../screens/TvDetailsScreen";
import PlayerScreen from "../screens/PlayerScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import UpdateRequiredScreen from "../screens/UpdateRequiredScreen";
import GenreDetailsScreen from "../screens/GenreDetailsScreen";

import AppHeader from "../components/AppHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// This component defines your main app interface with the bottom tabs
function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "MyList") {
            iconName = focused
              ? "checkmark-circle"
              : "checkmark-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else {
            iconName = "help-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#141414",
          borderTopWidth: 0,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        header: (props) => <AppHeader {...props} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="MyList"
        component={MyListScreen}
        options={{ title: "My List" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- START OF FIX ---
// This function is now more robust and will remove any extra quotes
const isUpdateRequired = (
  currentVersion: string,
  requiredVersion: string
): boolean => {
  if (!currentVersion || !requiredVersion) return false;
  // Remove any surrounding quotes from the strings before splitting
  const current = currentVersion.replace(/"/g, "").split(".").map(Number);
  const required = requiredVersion.replace(/"/g, "").split(".").map(Number);

  for (let i = 0; i < required.length; i++) {
    if (current[i] < (required[i] || 0)) return true;
    if (current[i] > (required[i] || 0)) return false;
  }
  return false;
};
// --- END OF FIX ---

// This is your main navigator that decides what the user sees on startup
export default function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const [updateRequired, setUpdateRequired] = useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = useState(true);

  // This useEffect runs once on app startup to check for mandatory updates
  useEffect(() => {
    const checkForUpdate = async () => {
      const remoteConfig = await fetchAppConfig();

      if (remoteConfig) {
        const requiredVersion = remoteConfig.minimum_required_version;
        const currentVersion = Constants.expoConfig?.version || "0.0.0";

        console.log(
          `Current app version: ${currentVersion}, Required version from server: ${requiredVersion}`
        );

        if (isUpdateRequired(currentVersion, requiredVersion)) {
          setUpdateRequired(true);
        }
      }

      // This will run regardless of whether the fetch succeeded or failed
      setCheckingForUpdate(false);
    };
    checkForUpdate();
  }, []);

  // While checking for updates or user status, show a full-screen loading spinner
  if (checkingForUpdate || authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#141414",
        }}
      >
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  // If an update is required, block the entire app and show the update screen
  if (updateRequired) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UpdateRequired" component={UpdateRequiredScreen} />
      </Stack.Navigator>
    );
  }

  // Otherwise, show the normal app flow based on login state
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // This sets a dark background during screen transitions, preventing a white flicker
        contentStyle: { backgroundColor: "#141414" },
      }}
    >
      {user ? (
        // If a user is logged in (or is a guest), show the main app experience
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="TvDetails" component={TvDetailsScreen} />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="GenreDetails"
            component={GenreDetailsScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        // If no user is logged in, show the authentication flow
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
