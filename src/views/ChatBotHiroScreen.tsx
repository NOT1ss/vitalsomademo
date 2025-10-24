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

const { width } = Dimensions.get("window");

const PRIMARY_GREEN = "#2E7D32";
const LIGHT_GREEN = "#E8F5E9";
const WHITE = "#FFFFFF";
const LIGHT_GRAY = "#F7F7F7";
const BORDER_GRAY = "#E0E0E0";
const TEXT_GRAY = "#616161";
const TOP_BAR_HEIGHT = 60;

const BOT_AVATAR = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";

// Helper para formatar datas
const formatConversationDate = (timestamp: string): string => {
  if (!timestamp) return "Sem Data";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Conversa Inválida";
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `Hoje, ${date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "Conversa Inválida";
  }
};

export default function ChatBotHiroScreen(): React.ReactElement {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    flatListRef,
    conversations,
    conversationId,
    loadConversation,
    newConversation,
  } = useChatViewModel();

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={styles.hamburgerButton}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.topBarText}>Assistente Hiro</Text>
      </View>

      {/* Chat principal */}
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
            <Image source={{ uri: BOT_AVATAR }} style={styles.avatar} />
            <ActivityIndicator size="small" color={PRIMARY_GREEN} />
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
          <TouchableOpacity
            style={styles.drawerBackground}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />

          <View style={styles.drawerMenu}>
            <Text style={styles.drawerTitle}>Histórico de Conversas</Text>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              style={{ flex: 1, marginVertical: 10 }}
              renderItem={({ item: conv, index }) => (
                <TouchableOpacity
                  key={conv.id}
                  onPress={() => {
                    loadConversation(conv.id);
                    setDrawerOpen(false);
                  }}
                  style={[
                    styles.drawerItemContainer,
                    conv.id === conversationId &&
                      styles.activeDrawerItemContainer,
                  ]}
                >
                  <Text style={styles.drawerItem}>
                    {`Conversa ${
                      conversations.length - index
                    } (${formatConversationDate(conv.created_at || "")})`}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => {
                newConversation();
                setDrawerOpen(false);
              }}
              style={styles.newChatButton}
            >
              <Text
                style={[
                  styles.drawerItem,
                  {
                    color: PRIMARY_GREEN,
                    fontWeight: "bold",
                    borderBottomWidth: 0,
                    fontSize: 18,
                  },
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
  container: { flex: 1, backgroundColor: LIGHT_GRAY },
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
    paddingHorizontal: 10,
    elevation: 4,
    zIndex: 10,
  },
  topBarText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_GREEN,
    marginRight: 35,
  },
  hamburgerButton: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 11,
  },
  hamburgerIcon: { fontSize: 24, color: PRIMARY_GREEN },
  chatContainer: { flex: 1 },
  messageList: {},
  messageListContent: { padding: 10 },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 5,
    backgroundColor: LIGHT_GRAY,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 999,
    top: TOP_BAR_HEIGHT,
  },
  drawerBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  drawerMenu: {
    width: width * 0.7,
    backgroundColor: WHITE,
    paddingHorizontal: 15,
    elevation: 10,
    flex: 1,
    paddingTop: 25,
    paddingBottom: 15,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: PRIMARY_GREEN,
    paddingLeft: 5,
  },
  drawerItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
    borderRadius: 5,
    marginBottom: 5,
  },
  activeDrawerItemContainer: { backgroundColor: LIGHT_GREEN },
  drawerItem: { fontSize: 14, color: TEXT_GRAY, fontWeight: "500" },
  newChatButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
    alignItems: "center",
  },
});
