// src/navigation/types.ts
import { DiaSemana } from '../models/semanaTreinoModel';

// Aqui definimos todas as telas e os parâmetros que elas podem receber
export type RootStackParamList = {
  Welcome: undefined;
  Cadastro: undefined;
  MainApp: undefined;
  Login: undefined;
  EsqueciSenha: undefined;
  ConfirmacaoCodigo: undefined;
  NovaSenha: undefined;
  Sucesso: undefined;
  Receitas: { selectedMeal?: string } | undefined;
  Alimentos: { selectedMeal?: string } | undefined;
  Treino: undefined;
  SemanaTreino: { novoRecorde?: string; diaAtualizado?: DiaSemana };
  TreinoCompleto: { dia: DiaSemana };
  CalendarioCompleto: { dias: DiaSemana[] };
  EditarTreino: { dia: DiaSemana; diaAtualizado?: DiaSemana };
  RegistrarTreino: { dia: DiaSemana; from?: 'SemanaTreino' | 'EditarTreino' };
  ReceitasList: { categoria: string };
  ReceitaDetail: { receitaId: number };
  ReceitasFavoritas: undefined;
};