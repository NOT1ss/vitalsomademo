export interface Activity {
  id?: number;
  user_id: string;
  created_at?: string;
  tipo_atividade: 'corrida' | 'caminhada' | 'ciclismo';
  distancia_km: number;
  duracao_segundos: number;
  ritmo_min_km: string;
  rota: { latitude: number; longitude: number }[];
}
