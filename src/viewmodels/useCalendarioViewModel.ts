// src/viewModels/useCalendarioViewModel.ts
import { useEffect, useState } from 'react';
import { CalendarioEvento } from '../models/calendarioModel';

export function useCalendarioViewModel() {
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);

  useEffect(() => {
    // Aqui no futuro pode vir dados do Supabase ou outro backend
    setEventos([
      {
        id: '1',
        titulo: 'Consulta médica',
        data: '2025-06-20',
      },
    ]);
  }, []);

  return {
    eventos,
  };
}
