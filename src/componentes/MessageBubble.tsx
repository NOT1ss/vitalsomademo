// src/componentes/MessageBubble.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Message } from "../models/Message";
import { FormattedMessage } from "./FormattedMessage";

// Importando as imagens locais
const HIRO_AVATAR = require("../../assets/images/hirophotouser.png");
// Usando a mesma imagem de fallback do EuScreen
const USER_AVATAR_FALLBACK = require("../../assets/images/eu.png");

type MessageBubbleProps = {
  message: Message;
  userAvatarUrl?: string;
};

export const MessageBubble = ({ message, userAvatarUrl }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Define o avatar do usuário - mesma lógica do EuScreen
  const userAvatarSource = userAvatarUrl 
    ? { uri: userAvatarUrl } 
    : USER_AVATAR_FALLBACK;

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.botMessageRow,
      ]}
    >
      {/* Avatar da Hiro (bot) - AGORA CINZA */}
      {!isUser && (
        <View style={[styles.avatarContainer, styles.botAvatarContainer]}>
          <Image
            source={HIRO_AVATAR}
            style={styles.avatar}
          />
        </View>
      )}

      {/* Balão de mensagem */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.sender}>{isUser ? "Você" : "Hiro"}</Text>
        
        {/* Mensagem formatada para o bot, texto simples para o usuário */}
        {isUser ? (
          <Text style={styles.messageText}>{message.text || ""}</Text>
        ) : (
          <FormattedMessage text={message.text || ""} />
        )}
        
        <Text style={styles.timestamp}>{formattedTime}</Text>
      </View>

      {/* Avatar do usuário - AGORA VERDE */}
      {isUser && (
        <View style={[styles.avatarContainer, styles.userAvatarContainer]}>
          <Image
            source={userAvatarSource}
            style={styles.avatar}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    overflow: "hidden",
  },
  // AGORA: Bot cinza
  botAvatarContainer: {
    backgroundColor: "#E0E0E0",
    borderWidth: 2,
    borderColor: "#9E9E9E",
  },
  // AGORA: Usuário verde
  userAvatarContainer: {
    backgroundColor: "#C8E6C9",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  // ==== BUBBLES ====
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: "#F5F5F5",
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#E8F5E9",
    borderTopLeftRadius: 4,
  },

  sender: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
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