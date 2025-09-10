// src/components/AppHeader.tsx
import React from "react";
import { View, Image, StyleSheet, SafeAreaView, Platform } from "react-native";
import { getHeaderTitle } from "@react-navigation/elements"; // Helper for title if needed

interface AppHeaderProps {
  // These props are passed by React Navigation if you use it as header (optional for now)
  // navigation?: any;
  // route?: any;
  // options?: any;
  // back?: any;
}

const AppHeader: React.FC<AppHeaderProps> = (props) => {
  // You can use getHeaderTitle if you want a fallback title, but for a logo, it's not strictly necessary
  // const title = getHeaderTitle(props.options, props.route.name);

  return (
    // SafeAreaView helps with notch/status bar on iOS and Android
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/header-logo.png")} // Adjust path if your logo is elsewhere
          style={styles.logo}
          resizeMode="contain" // Ensures the entire logo is visible
        />
        {/* You could add buttons here, e.g., a search icon or profile icon */}
        {/* <TouchableOpacity style={styles.rightButton}>
          <Text style={styles.rightButtonText}>Search</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000", // Black background for the entire header area
    // Padding for Android status bar if not handled by SafeAreaView
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    height: 60, // Standard header height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the logo horizontally
    backgroundColor: "#000", // Black background for the header bar
    paddingHorizontal: 15,
  },
  logo: {
    width: 150, // Adjust width as needed
    height: 35, // Adjust height as needed
  },
  // Example for potential right-side buttons
  // rightButton: {
  //   position: 'absolute',
  //   right: 15,
  // },
  // rightButtonText: {
  //   color: 'white',
  //   fontSize: 16,
  // },
});

export default AppHeader;
