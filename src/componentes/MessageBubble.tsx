import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Message } from "../models/Message";

type MessageBubbleProps = {
  message: Message;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.botMessageRow,
      ]}
    >
      {/* Avatar (bot) */}
      {!isUser && (
        <View style={[styles.avatarContainer, styles.botAvatarContainer]}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
            }}
            style={styles.avatarIcon}
          />
        </View>
      )}

      {/* Balão */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.sender}>{isUser ? "Você" : "Hiro"}</Text>
        <Text style={styles.messageText}>{message.text || ""}</Text>
        <Text style={styles.timestamp}>{formattedTime}</Text>
      </View>

      {/* Avatar (usuário) */}
      {isUser && (
        <View style={[styles.avatarContainer, styles.userAvatarContainer]}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
            }}
            style={styles.avatarIcon}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  userMessageRow: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  botMessageRow: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },

  // ==== AVATAR ====
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  botAvatarContainer: {
    backgroundColor: "#C8E6C9", // verde suave
    borderWidth: 1,
    borderColor: "#81C784",
  },
  userAvatarContainer: {
    backgroundColor: "#E0E0E0", // cinza suave
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  avatarIcon: {
    width: 20,
    height: 20,
    tintColor: "#2E7D32", // aplica o verde no ícone
  },

  // ==== BUBBLES ====
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: "#F5F5F5",
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: "#E8F5E9",
    borderTopLeftRadius: 0,
  },

  sender: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: "#222",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    alignSelf: "flex-end",
  },
});
