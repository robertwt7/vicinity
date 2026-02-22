import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

export default function ModalScreen() {
  return (
    <Pressable style={styles.overlay} onPress={() => router.back()}>
      <View style={styles.content}>
        <Text style={styles.title}>Vicinity</Text>
        <Text style={styles.description}>
          Real-time community incident reporting. Stay aware of what's happening around you.
        </Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Got it</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.textSub,
    textAlign: "center",
    lineHeight: 22,
  },
  closeBtn: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bg,
  },
});
