import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Message } from '../models/Message';

type MessageBubbleProps = {
  message: Message;
};

// Componente "burro" que apenas renderiza um balão de mensagem.
export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.botMessageRow]}>
      {!isUser && <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" }} style={styles.avatar} />}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.sender}>{isUser ? "Você" : "Hiro"}</Text>
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      </View>
      {isUser && <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" }} style={styles.avatar} />}
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, maxWidth: '90%' },
  userMessageRow: { alignSelf: "flex-end" },
  botMessageRow: { alignSelf: "flex-start" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 6 },
  bubble: { padding: 12, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  userBubble: { backgroundColor: "#DCF8C6", borderTopRightRadius: 4 },
  botBubble: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 4 },
  sender: { fontSize: 12, fontWeight: "bold", marginBottom: 4, color: "#555" },
  messageText: { fontSize: 15, color: "#222" },
  timestamp: { fontSize: 11, color: "#888", alignSelf: "flex-end", marginTop: 6 },
});