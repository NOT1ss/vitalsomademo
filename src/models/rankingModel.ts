// src/models/rankingModel.ts
export interface UsuarioRanking {
  id: string;
  nome: string;
  pontos: number;
  avatar_url?: string; // Adicionando a URL do avatar
}
