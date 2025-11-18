// src/viewModels/useRankingViewModel.ts
  import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { UsuarioRanking } from '../models/rankingModel';
import supabase from '../supabaseClient';

  export function useRankingViewModel() {
    const [ranking, setRanking] = useState<UsuarioRanking[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRanking = useCallback(async () => {
      setIsLoading(true);
      try {
        // 1. Buscar dados da tabela ranking
        const { data: rankingData, error: rankingError } = await supabase
          .from('ranking')
          .select('usuario_id, pontos')
          .order('pontos', { ascending: false });

        if (rankingError) throw rankingError;
        if (!rankingData) return;

        // 2. Extrair os IDs de usuário
        const userIds = rankingData.map(r => r.usuario_id);

        // 3. Buscar os perfis correspondentes a esses IDs
        const { data: profilesData, error: profilesError } = await supabase
          .from('usuarios')
          .select('id, nome, avatar_url') // Adicionar avatar_url
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // 4. Criar mapas de ID -> nome e ID -> avatar_url para busca rápida
        const usernameMap = new Map<string, string>();
        const avatarUrlMap = new Map<string, string>(); // Novo mapa
        profilesData.forEach(profile => {
          usernameMap.set(profile.id, profile.nome);
          if (profile.avatar_url) { // Adicionar avatar_url se existir
            avatarUrlMap.set(profile.id, profile.avatar_url);
          }
        });

        // 5. Combinar os dados
        const formattedRanking: UsuarioRanking[] = rankingData.map(item => ({
          id: item.usuario_id,
          nome: usernameMap.get(item.usuario_id) || 'Usuário Anônimo',
          pontos: item.pontos,
          avatar_url: avatarUrlMap.get(item.usuario_id) || undefined, // Usar o novo mapa
        }));

        setRanking(formattedRanking);

      } catch (error: any) {
        Alert.alert('Erro', 'Não foi possível carregar o ranking.');
        console.error('Error fetching ranking:', error.message);
      } finally {
        setIsLoading(false);
      }
    }, []);

    // useFocusEffect garante que o ranking seja atualizado sempre que a tela recebe foco
    useFocusEffect(
      useCallback(() => {
        fetchRanking();
      }, [fetchRanking])
    );

    return {
      ranking,
      isLoading,
      fetchRanking, // Exporta para permitir "puxar para atualizar"
    };
  }