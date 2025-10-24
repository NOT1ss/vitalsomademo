// src/models/desafioModel.ts

// Representa um desafio que está disponível para ser aceito
export interface Desafio {
  id: number;
  titulo: string;
  descricao: string;
  pontos: number;
  tipo: string;
  meta_km: number;
  duracao_dias: number;
}

// Representa um desafio que foi aceito por um usuário e está em andamento
export interface DesafioAtivo {
  id: number; // ID do registro na tabela desafios_usuarios
  usuario_id: string;
  desafio_id: number;
  data_inicio: string;
  progresso_km: number;
  status: string;
  // Inclui os detalhes do desafio original
  desafio: Desafio;
}
