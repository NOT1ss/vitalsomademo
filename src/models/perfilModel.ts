// src/models/perfilModel.ts
export interface PerfilUsuario {
  nome: string;
  email: string;
  daily_calorie_goal?: number;
  altura?: number;
  peso?: number;
  imc?: number;
}