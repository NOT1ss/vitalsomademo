// src/viewmodels/useDesafiosViewModel.ts
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Desafio, DesafioAtivo } from '../models/desafioModel';
import { addPoints, getUserProfile, subtractPoints } from '../services/saudeService'; // Importar addPoints
import supabase from '../supabaseClient';

export const useDesafiosViewModel = () => {
  const [desafiosDisponiveis, setDesafiosDisponiveis] = useState<Desafio[]>([]);
  const [desafioAtivo, setDesafioAtivo] = useState<DesafioAtivo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDesafios = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error("Usuário não encontrado");

      // Executa as duas buscas em paralelo para mais eficiência
      const [activeResult, availableResult] = await Promise.all([
        // 1. Busca o desafio ativo do usuário
        supabase
          .from('desafios_usuarios')
          .select(`*, desafio:desafios (*)`)
          .eq('usuario_id', profile.id)
          .eq('status', 'ativo')
          .single(),
        // 2. Busca todos os desafios que existem
        supabase.from('desafios').select('*'),
      ]);

      const { data: activeChallenge, error: activeError } = activeResult;
      const { data: available, error: availableError } = availableResult;

      // Trata erros de qualquer uma das buscas
      if (activeError && activeError.code !== 'PGRST116') throw activeError;
      if (availableError) throw availableError;

      // Atualiza os estados
      setDesafioAtivo(activeChallenge as DesafioAtivo | null);
      setDesafiosDisponiveis(available || []);

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os desafios.');
      console.error('Erro ao buscar desafios:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completarDesafio = useCallback(async (desafioConcluido: DesafioAtivo) => {
    console.log('[completarDesafio] function called');
    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error("Usuário não encontrado");
      console.log('[completarDesafio] User Profile ID:', profile.id);

      // 1. Atualiza o status do desafio para 'concluido'
      const { error: updateError } = await supabase
        .from('desafios_usuarios')
        .update({ status: 'concluido' })
        .eq('id', desafioConcluido.id);

      if (updateError) {
        console.error('[completarDesafio] Erro ao atualizar status do desafio:', updateError);
        throw updateError;
      }
      console.log('[completarDesafio] Status do desafio atualizado para concluido.');
      console.log('[completarDesafio] Desafio Tipo:', desafioConcluido.desafio.tipo);
      console.log('[completarDesafio] Desafio Duração Dias:', desafioConcluido.desafio.duracao_dias);

      // 2. Adiciona os pontos
      let pointsToAward = 0;
      if (desafioConcluido.desafio.duracao_dias === 7) {
        pointsToAward = 50;
      } else if (desafioConcluido.desafio.duracao_dias === 30) {
        pointsToAward = 200;
      } else if (desafioConcluido.desafio.duracao_dias === 15 && desafioConcluido.desafio.tipo === 'ciclismo') {
        pointsToAward = 200;
      }
      console.log('[completarDesafio] Pontos a serem concedidos:', pointsToAward);

      if (pointsToAward > 0) {
        await addPoints(profile.id, pointsToAward);
        Alert.alert('Desafio Concluído!', `Parabéns! Você ganhou ${pointsToAward} pontos.`);
      } else {
        Alert.alert('Desafio Concluído!', 'Parabéns por completar o desafio!');
      }

      fetchDesafios(); // Re-busca os dados para atualizar a UI

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível concluir o desafio.');
      console.error('[completarDesafio] Erro geral:', error.message);
    }
  }, [fetchDesafios]);

  const aceitarDesafio = useCallback(async (desafioId: number) => {
    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error("Usuário não encontrado");

      // Insere o novo desafio ativo para o usuário
      const { error } = await supabase
        .from('desafios_usuarios')
        .insert({
          usuario_id: profile.id,
          desafio_id: desafioId,
        });

      if (error) throw error;

      Alert.alert('Sucesso!', 'Desafio aceito. Acompanhe seu progresso!');
      fetchDesafios(); // Re-busca os dados para mostrar o desafio ativo

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível aceitar o desafio.');
      console.error('Erro ao aceitar desafio:', error.message);
    }
  }, [fetchDesafios]);

  const cancelarDesafio = useCallback(async () => {
    if (!desafioAtivo) return;

    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error("Usuário não encontrado");

      // 1. Subtrai os pontos de penalidade
      await subtractPoints(profile.id, 5);

      // 2. Deleta o desafio da tabela de desafios ativos
      const { error } = await supabase
        .from('desafios_usuarios')
        .delete()
        .eq('id', desafioAtivo.id);

      if (error) throw error;

      Alert.alert('Desafio Cancelado', 'Você perdeu 5 pontos por cancelar.');
      fetchDesafios(); // Re-busca os dados para mostrar a lista de desafios disponíveis

    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível cancelar o desafio.');
      console.error('Erro ao cancelar desafio:', error.message);
    }
  }, [desafioAtivo, fetchDesafios]);

  // Busca os dados sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchDesafios();
    }, [fetchDesafios])
  );

  return {
    isLoading,
    desafiosDisponiveis,
    desafioAtivo,
    aceitarDesafio,
    cancelarDesafio,
    completarDesafio, // Exportar a nova função
    fetchDesafios,
  };
};
