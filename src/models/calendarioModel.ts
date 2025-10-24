// src/models/calendarioModel.ts
export interface CalendarioEvento {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  descricao?: string;
}
