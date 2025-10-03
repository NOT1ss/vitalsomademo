// src/models/treinoRealizadoModel.ts

// Define uma única série realizada pelo usuário
export interface SerieRealizada {
  id: string; // Ex: 'serie-1'
  reps: string;
  carga: string;
}

// Define um exercício completo que foi realizado
export interface ExercicioRealizado {
  id: string; // Ex: 'ex-realizado-1'
  nome: string;
  // Link para o exercício planejado, se houver
  exercicioPlanejadoId?: string; 
  series: SerieRealizada[];
}

