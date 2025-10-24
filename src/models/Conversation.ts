// src/models/Conversation.ts
import { Message } from "./Message";

export type Conversation = {
  id: string; 
  user_id: string; // Adicionado para resolver erros de tipagem
  created_at: string; 
  messages: Message[];
};