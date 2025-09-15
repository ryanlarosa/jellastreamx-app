import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Button,
  FlatList, // Use FlatList for better performance
} from "react-native";
import { StreamSource } from "../api/streamResolver"; // Import our new type

interface StreamSelectionModalProps {
  isVisible: boolean;
  streams: StreamSource[];
  onClose: () => void;
  onSelectStream: (stream: StreamSource) => void;
}

const StreamSelectionModal: React.FC<StreamSelectionModalProps> = ({
  isVisible,
  streams,
  onClose,
  onSelectStream,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <SafeAreaView>
            <Text style={styles.title}>Select Stream Quality</Text>
            <FlatList
              data={streams}
              keyExtractor={(item) => item.url}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.streamButton}
                  onPress={() => {
                    onSelectStream(item);
                    onClose();
                  }}
                >
                  <Text style={styles.streamQuality}>{item.quality}</Text>
                  <Text style={styles.streamUrl} numberOfLines={1}>
                    {item.url}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No streams found.</Text>
              }
            />
            <View style={styles.cancelButtonContainer}>
              <Button title="Cancel" onPress={onClose} color="#E50914" />
            </View>
          </SafeAreaView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%", // Don't let it take up the whole screen
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  streamButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  streamQuality: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  streamUrl: {
    color: "gray",
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: "gray",
    textAlign: "center",
    padding: 20,
  },
  cancelButtonContainer: {
    marginTop: 10,
  },
});

export default StreamSelectionModal;
