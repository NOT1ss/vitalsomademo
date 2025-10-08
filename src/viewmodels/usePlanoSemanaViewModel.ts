import { useState, useCallback } from 'react';
import supabase from '../supabaseClient';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from '../services/saudeService';
import { Exercicio, PlanoFormParams } from './useExerciciosViewModel';

// Interface para o item do plano de treino
export interface PlanoTreinoItem {
  id: number;
  dia_da_semana: number;
  series: number;
  repeticoes: string;
  notas: string;
  exercicio: Exercicio;
}

// Interface para a seção da lista do plano
export interface PlanoSemanaSection {
  title: string; // Ex: "Segunda-feira"
  data: PlanoTreinoItem[];
}

const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const usePlanoSemanaViewModel = () => {
  const [plano, setPlano] = useState<PlanoSemanaSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlano = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error('Perfil não encontrado');

      const { data, error } = await supabase
        .from('plano_treino_usuario')
        .select(`
          id, dia_da_semana, series, repeticoes, notas,
          exercicio:exercicios (*)
        `)
        .eq('usuario_id', profile.id)
        .order('dia_da_semana', { ascending: true });

      if (error) throw error;

      const grouped: { [key: number]: PlanoTreinoItem[] } = {};
      data.forEach(item => {
        if (!grouped[item.dia_da_semana]) {
          grouped[item.dia_da_semana] = [];
        }
        grouped[item.dia_da_semana].push(item as PlanoTreinoItem);
      });

      const sections: PlanoSemanaSection[] = Object.keys(grouped).map(key => ({
        title: diasDaSemana[parseInt(key)],
        data: grouped[parseInt(key)],
      }));

      setPlano(sections);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar o plano de treino.');
      console.error('Error fetching workout plan:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlano();
    }, [fetchPlano])
  );

  const removeExercicioFromPlano = useCallback(async (planoItemId: number) => {
    try {
      const { error } = await supabase
        .from('plano_treino_usuario')
        .delete()
        .eq('id', planoItemId);

      if (error) throw error;

      // Atualizar o estado local para remover o item
      fetchPlano(); // A maneira mais simples de atualizar a lista
      Alert.alert('Sucesso', 'Exercício removido do plano.');
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível remover o exercício.');
      console.error('Error removing exercise from plan:', error.message);
    }
  }, [fetchPlano]);

  const updateExercicioInPlano = useCallback(async (planoItemId: number, form: PlanoFormParams) => {
    try {
      const { error } = await supabase
        .from('plano_treino_usuario')
        .update({
          dia_da_semana: parseInt(form.dia_da_semana, 10) || 1,
          series: parseInt(form.series, 10),
          repeticoes: form.repeticoes,
          notas: form.notas,
        })
        .eq('id', planoItemId);

      if (error) throw error;

      fetchPlano();
      Alert.alert('Sucesso', 'Exercício atualizado no plano.');
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o exercício.');
      console.error('Error updating exercise in plan:', error.message);
    }
  }, [fetchPlano]);

  return {
    plano,
    isLoading,
    fetchPlano,
    removeExercicioFromPlano,
    updateExercicioInPlano,
  };
};