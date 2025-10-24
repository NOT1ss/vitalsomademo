// src/services/conversationService.ts
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation"; 
import supabase from "../supabaseClient";

/**
 * Insere uma mensagem na tabela `messages`.
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

/**
 * Cria uma nova conversa e insere a primeira mensagem.
 */
export async function createConversation(authUserId: string, firstMessage: Message) {
  if (!authUserId) throw new Error("createConversation: authUserId não informado");

  const { data: convData, error: convError } = await supabase
    .from("conversations")
    .insert([{ user_id: authUserId }])
    .select("id") 
    .single();

  if (convError) {
    console.error("createConversation: erro ao inserir conversation:", convError);
    throw convError;
  }

  try {
    await addMessage((convData as any).id, firstMessage);
  } catch (err) {
    console.warn("createConversation: falha ao inserir primeira mensagem, mas a conversa foi criada.", err);
  }

  return convData as any;
}

/**
 * Retorna lista de conversas do usuário, buscando MENSAGENS ANINHADAS
 * em uma única chamada ao Supabase.
 */
export async function getConversations(authUserId: string): Promise<Conversation[]> {
  if (!authUserId) throw new Error("getConversations: authUserId não informado");

  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select(`
      id,
      user_id,          
      created_at,
      messages (       
        id, 
        role, 
        text, 
        timestamp
      )
    `) 
    .eq("user_id", authUserId)
    .order("created_at", { ascending: false });

  if (convError) {
    console.error("getConversations: erro ao buscar conversations:", convError);
    throw convError;
  }
  
  return (convs as Conversation[]) ?? [];
}