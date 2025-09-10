import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Button,
} from "react-native";

// Define the shape of a Server object for type safety
interface Server {
  name: string;
  getUrl: Function;
}

interface ServerSelectionModalProps {
  isVisible: boolean;
  servers: Server[];
  onClose: () => void;
  onSelectServer: (server: Server) => void;
}

const ServerSelectionModal: React.FC<ServerSelectionModalProps> = ({
  isVisible,
  servers,
  onClose,
  onSelectServer,
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
          <SafeAreaView style={styles.content}>
            <Text style={styles.title}>Select a Server</Text>
            {servers.map((server) => (
              <TouchableOpacity
                key={server.name}
                style={styles.serverButton}
                onPress={() => {
                  onSelectServer(server);
                  onClose(); // Automatically close after selection
                }}
              >
                <Text style={styles.serverButtonText}>{server.name}</Text>
              </TouchableOpacity>
            ))}
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
    justifyContent: "flex-end", // Aligns the modal to the bottom
  },
  container: {
    backgroundColor: "#1C1C1E", // A dark, slightly off-black color
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  content: {
    // SafeAreaView content
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  serverButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  serverButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonContainer: {
    marginTop: 10,
  },
});

export default ServerSelectionModal;
