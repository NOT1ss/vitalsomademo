// src/viewModels/useRankingViewModel.ts
import { useEffect, useState } from 'react';
import { UsuarioRanking } from '../models/rankingModel';

export function useRankingViewModel() {
  const [ranking, setRanking] = useState<UsuarioRanking[]>([]);

  useEffect(() => {
    setRanking([
      { id: '1', nome: 'João', pontos: 150 },
      { id: '2', nome: 'Maria', pontos: 140 },
      { id: '3', nome: 'Você', pontos: 135 },
    ]);
  }, []);

  return {
    ranking,
  };
}
