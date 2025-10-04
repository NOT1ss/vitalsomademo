// src/view/ChatBotHiroScreen.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatInputBar } from "../componentes/ChatInputBar";
import { MessageBubble } from "../componentes/MessageBubble";
import { useChatViewModel } from "../viewmodels/useChatViewModel";

// pega a largura da tela para calcular o tamanho do menu
const { width } = Dimensions.get("window");

export default function ChatBotHeroScreen(): React.ReactElement {
  const { messages, input, setInput, isLoading, handleSend, flatListRef } =
    useChatViewModel();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Histórico de conversas (simples localmente)
  const [conversations, setConversations] = useState<
    { id: string; title?: string }[]
  >([]);

  const newConversation = () => {
    const id = Date.now().toString();
    setConversations((prev) => [
      ...prev,
      { id, title: `Conversa ${prev.length + 1}` },
    ]);
    console.log("Nova conversa criada", id);
  };

  const loadConversation = (id: string) => {
    console.log("Carregando conversa", id);
    // Aqui você pode integrar a lógica para carregar mensagens reais do Supabase
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        {/* Botão hamburguer */}
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={styles.hamburgerButton}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.topBarText}>Assistente Hiro</Text>
      </View>

      {/* Conteúdo principal */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <MessageBubble message={item} />}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />

        {isLoading && (
          <View style={styles.typingIndicatorContainer}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
              }}
              style={styles.avatar}
            />
            <ActivityIndicator size="small" color="#888" />
          </View>
        )}

        <ChatInputBar
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>

      {/* Drawer lateral */}
      {drawerOpen && (
        <View style={styles.drawerOverlay}>
          {/* Fundo que fecha o menu */}
          <TouchableOpacity
            style={styles.drawerBackground}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />

          {/* O menu em si */}
          <View style={styles.drawerMenu}>
            <Text style={styles.drawerTitle}>Histórico de Conversas</Text>

            {conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => {
                  loadConversation(conv.id);
                  setDrawerOpen(false);
                }}
              >
                <Text style={styles.drawerItem}>
                  {conv.title || `Conversa ${conv.id.slice(0, 5)}`}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                newConversation();
                setDrawerOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerItem,
                  { color: "#2E7D32", fontWeight: "bold" },
                ]}
              >
                ➕ Novo Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  topBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingHorizontal: 10,
  },
  topBarText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 35, // espaço pra não sobrepor o ícone
  },
  hamburgerButton: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 10,
  },
  hamburgerIcon: {
    fontSize: 22,
    color: "#2E7D32", // verde do projeto
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {},
  messageListContent: {
    padding: 10,
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 5,
    backgroundColor: "transparent",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Drawer styles
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  drawerBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawerMenu: {
    width: width * 0.6, // cobre 60% da tela
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2E7D32",
  },
  drawerItem: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
});
