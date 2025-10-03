// src/viewmodels/useChatViewModel.ts
import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { Message } from "../models/Message";
import { ChatService } from "../services/ChatService";
import { addMessage, createConversation, getConversations } from "../services/conversationService";
import supabase from "../supabaseClient";

type UseChatVMReturn = {

  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  handleSend: () => Promise<void>;
  flatListRef: React.RefObject<FlatList<any> | null>;

  // novos campos
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  loadConversation: (convId: string) => Promise<void>;
  newConversation: () => Promise<void>;
};


export const useChatViewModel = (): UseChatVMReturn => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text: "Olá! Sou sua IA nutricionista. Como posso te ajudar hoje?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<any> | null>(null);

  // Pega usuário logado (auth) ao montar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn("useChatViewModel: erro ao getUser:", error);
          return;
        }
        if (data?.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.warn("useChatViewModel: exception getUser:", err);
      }
    };
    fetchUser();
  }, []);

  // Carrega histórico do usuário (quando userId estiver disponível)
  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      try {
        const convs = await getConversations(userId);
        if (!mounted) return;
        if (convs && convs.length > 0) {
          setConversationId(convs[0].id);
          setMessages(convs[0].messages || []);
        }
      } catch (err) {
        console.error("Erro ao carregar conversas:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;
    if (!userId) {
      console.error("Erro: usuário não logado.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    let currentConvId = conversationId;
    try {
      if (!currentConvId) {
        const newConv = await createConversation(userId, userMessage);
        currentConvId = (newConv as any).id;
        setConversationId(currentConvId);
      } else {
        await addMessage(currentConvId, userMessage);
      }
    } catch (err) {
      console.error("Erro ao salvar msg do usuário:", err);
    }

    // obter resposta do bot
    let botReplyText = "";
    try {
      botReplyText = await ChatService.getBotReply(userMessage.text);
    } catch (err) {
      console.error("Erro ao obter resposta do bot:", err);
      botReplyText = "Desculpe, ocorreu um erro. Tente novamente mais tarde.";
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: botReplyText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, botMessage]);

    // salva a resposta do bot
    try {
      if (!currentConvId) {
        const newConv = await createConversation(userId, userMessage);
        currentConvId = (newConv as any).id;
        setConversationId(currentConvId);
      }
      // aqui usamos `!` porque já garantimos que não é null
      await addMessage(currentConvId!, botMessage);
    } catch (err) {
      console.error("Erro ao salvar msg do bot:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return {
  messages,
  input,
  setInput,
  isLoading,
  handleSend,
  flatListRef,
  conversationId,
  setConversationId,
  loadConversation: async (convId: string) => {
    try {
      const convs = await getConversations(userId!);
      const conv = convs.find(c => c.id === convId);
      if (conv) {
        setConversationId(conv.id);
        setMessages(conv.messages || []);
      }
    } catch (err) {
      console.error("Erro ao carregar conversa específica:", err);
    }
  },
  newConversation: async () => {
    if (!userId) return;
    try {
      const newConv = await createConversation(userId, {
        id: Date.now().toString(),
        role: "bot",
        text: "Nova conversa iniciada",
        timestamp: new Date().toISOString(),
      });
      setConversationId((newConv as any).id);
      setMessages([]);
    } catch (err) {
      console.error("Erro ao criar nova conversa:", err);
    }
  }
};
};
