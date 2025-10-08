// src/viewmodels/useChatViewModel.ts
import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { Conversation } from "../models/Conversation"; 
// Importa o Message e os helpers, mantendo a compatibilidade com seu modelo:
import { Message, makeBotMessage, makeUserMessage } from "../models/Message"; 
import { ChatService } from "../services/ChatService"; // Assuma que este arquivo existe
import { addMessage, createConversation, getConversations } from "../services/conversationService";
import supabase from "../supabaseClient"; // Assuma que o cliente Supabase está configurado

// DEFINIÇÃO DA INTERFACE COMPLETA (Necessária para resolver erros de tipagem na tela)
type UseChatVMReturn = {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  handleSend: () => Promise<void>;
  flatListRef: React.RefObject<FlatList<any> | null>;

  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  conversations: Conversation[];
  loadConversations: () => Promise<void>;
  loadConversation: (convId: string) => Promise<void>;
  newConversation: () => Promise<void>;
};


export const useChatViewModel = (): UseChatVMReturn => {
  const defaultInitialMessage: Message = makeBotMessage("Olá! Sou sua IA nutricionista. Como posso te ajudar hoje?");

  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]); 

  const flatListRef = useRef<FlatList<any> | null>(null);

  // Lógica para pegar o userId logado
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


  // FUNÇÃO PARA CARREGAR A LISTA DE CONVERSAS
  const loadConversations = async () => {
    if (!userId) return;
    try {
      // Usando 'as any' para evitar erro de Parser no seu código
      const convs = (await getConversations(userId)) as any; 
      
      setConversations(convs);
      
      if (convs && convs.length > 0 && !conversationId) {
          setConversationId(convs[0].id);
          setMessages(convs[0].messages || []);
      }
    } catch (err) {
      console.error("Erro ao carregar lista de conversas:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadConversations();
  }, [userId]);

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;
    if (!userId) {
      console.error("Erro: usuário não logado.");
      return;
    }

    const userMessage = makeUserMessage(input, { userId: userId }); 

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    let currentConvId = conversationId;
    let isNewConversation = false;

    // 1. GARANTE O ID DA CONVERSA: Cria ou usa o existente
    try {
      if (!currentConvId) {
        const newConv = await createConversation(userId, userMessage); 
        currentConvId = (newConv as any).id;
        setConversationId(currentConvId);
        isNewConversation = true;
      } else {
        await addMessage(currentConvId, userMessage);
      }
    } catch (err) {
      console.error("Erro ao salvar msg do usuário:", err);
      setIsLoading(false); 
      return; 
    }

    // 2. Obtém resposta do bot
    let botReplyText = "";
try {
  botReplyText = await ChatService.getBotReply(input.trim());
} catch (err) {
  console.error("Erro ao obter resposta do bot:", err);
  botReplyText = "Desculpe, ocorreu um erro. Tente novamente mais tarde.";
}


    const botMessage = makeBotMessage(botReplyText);

    setMessages((prev) => [...prev, botMessage]);

    // 3. Salva a resposta do bot e finaliza
    try {
      await addMessage(currentConvId!, botMessage);
    } catch (err) {
      console.error("Erro ao salvar msg do bot:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      if (isNewConversation) {
          await loadConversations();
      }
    }
  };
  
  // FUNÇÃO PARA CARREGAR UMA CONVERSA ESPECÍFICA (navegação do Drawer)
  const loadConversation = async (convId: string) => {
    if (!userId) return;
    try {
      let conv = conversations.find(c => c.id === convId);

      if (!conv) {
          await loadConversations();
          conv = conversations.find(c => c.id === convId);
      }
      
      if (conv) {
        setConversationId(conv.id);
        setMessages(conv.messages || []); 
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error("Erro ao carregar conversa específica:", err);
    }
  };

  // FUNÇÃO PARA CRIAR UMA NOVA CONVERSA (Botão 'Novo Chat')
  const newConversation = async () => {
    if (!userId) return;
    try {
      // 1. ZERA O ID DA CONVERSA ATIVA
      setConversationId(null);
      
      // 2. CRIA A MENSAGEM INICIAL (Seu Reset Visual)
      const initialMessage = makeBotMessage("Nova conversa iniciada. Como posso te ajudar?");
      
      // 3. LIMPA A TELA e insere a mensagem inicial
      setMessages([initialMessage]);
      
      // 4. Garante que a lista de conversas no Drawer esteja atualizada
      await loadConversations();
      
    } catch (err) {
      console.error("Erro ao iniciar nova conversa:", err);
    }
  }

  // Retorna todos os estados e funções
  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    flatListRef,
    conversationId,
    setConversationId,
    conversations,
    loadConversations,
    loadConversation,
    newConversation,
  };
};