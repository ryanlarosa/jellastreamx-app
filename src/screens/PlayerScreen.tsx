import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

const injectedJavaScript = `
  const postMessage = (type) => window.ReactNativeWebView.postMessage(type);
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      postMessage('fullscreen_enter');
    } else {
      postMessage('fullscreen_exit');
    }
  });
  true;
`;

type Props = {
  route: { params: { streamUrl: string; title: string } };
};

export default function PlayerScreen({ route }: Props) {
  const { streamUrl } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [isLandscape, setIsLandscape] = useState(false);

  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === "fullscreen_enter") {
      setIsLandscape(true);
    } else if (message === "fullscreen_exit") {
      setIsLandscape(false);
    }
  };

  useEffect(() => {
    const setOrientation = async () => {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("inset-swipe");
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        await NavigationBar.setVisibilityAsync("visible");
      }
    };
    setOrientation();
  }, [isLandscape]);

  useEffect(() => {
    // Cleanup function to ensure we always leave in portrait mode
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#E50914" />
    </View>
  );

  return (
    // --- START OF FIX ---
    // The top inset is now applied as padding, but only when in portrait mode.
    // The bottom inset is always applied to protect the WebView's controls.
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          paddingTop: isLandscape ? 0 : insets.top,
        },
      ]}
    >
      {/* --- END OF FIX --- */}
      <StatusBar hidden={isLandscape} style="light" />
      <WebView
        style={styles.webview}
        source={{ uri: streamUrl }}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        userAgent={DESKTOP_USER_AGENT}
        referrerPolicy="origin-when-cross-origin"
        startInLoadingState={true}
        renderLoading={renderLoading}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
      />

      {/* Our custom back button has been completely removed. */}
      {/* The user will now use the WebView's own back button. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});
