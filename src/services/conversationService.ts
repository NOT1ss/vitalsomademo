// src/services/conversationService.ts
import { Message } from "../models/Message";
import supabase from "../supabaseClient";

/**
 * Cria uma nova conversa (apenas user_id e created_at).
 * Em seguida tenta inserir a primeira mensagem na tabela `messages`.
 * Retorna o objeto da conversa criado (contendo .id).
 */
export async function createConversation(authUserId: string, firstMessage: Message) {
  if (!authUserId) throw new Error("createConversation: authUserId não informado");

  // Insere nova conversa (apenas user_id)
  const { data: convData, error: convError } = await supabase
    .from("conversations")
    .insert([{ user_id: authUserId }])
    .select()
    .single();

  if (convError) {
    console.error("createConversation: erro ao inserir conversation:", convError);
    throw convError;
  }

  // Tenta inserir a primeira mensagem na tabela messages
  try {
    await addMessage((convData as any).id, firstMessage);
  } catch (err) {
    console.warn("createConversation: falha ao inserir primeira mensagem:", err);
    // não abortamos — a conversa foi criada com sucesso; a mensagem pode ser inserida depois.
  }

  return convData as any;
}

/**
 * Retorna lista de conversas do usuário (cada item com .id, .created_at e .messages[])
 */
export async function getConversations(authUserId: string) {
  if (!authUserId) throw new Error("getConversations: authUserId não informado");

  // busca conversas do usuário
  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id, created_at")
    .eq("user_id", authUserId)
    .order("created_at", { ascending: false });

  if (convError) {
    console.error("getConversations: erro ao buscar conversations:", convError);
    throw convError;
  }

  const conversations = (convs as any[]) ?? [];

  // para cada conversa, busca mensagens na tabela messages
  const results = await Promise.all(
    conversations.map(async (c) => {
      try {
        const { data: msgs, error: msgsError } = await supabase
          .from("messages")
          .select("id, role, text, timestamp")
          .eq("conversation_id", c.id)
          .order("timestamp", { ascending: true });

        if (msgsError) {
          console.warn("getConversations: erro ao buscar messages para conv", c.id, msgsError);
          return { id: c.id, created_at: c.created_at, messages: [] as Message[] };
        }

        return { id: c.id, created_at: c.created_at, messages: (msgs as Message[]) ?? [] };
      } catch (err) {
        console.warn("getConversations: exception ao buscar msgs para conv", c.id, err);
        return { id: c.id, created_at: c.created_at, messages: [] as Message[] };
      }
    })
  );

  return results;
}

/**
 * Insere uma mensagem na tabela `messages`.
 * conversationId deve ser UUID string.
 */
export async function addMessage(conversationId: string, message: Message) {
  if (!conversationId) throw new Error("addMessage: conversationId inválido");

  const payload = {
    conversation_id: conversationId,
    role: message.role,
    text: message.text,
    timestamp: message.timestamp ?? new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("messages")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("addMessage: erro ao inserir message:", error);
    throw error;
  }

  return data;
}
