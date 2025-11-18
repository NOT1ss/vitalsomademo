import { useState, useCallback } from 'react';
import supabase from '../supabaseClient';
import { Alert } from 'react-native';
import { getUserProfile } from '../services/saudeService';

// Interface para o objeto de exercício
export interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
  descricao: string;
  instrucoes: string;
  imagem_url: string;
}

// Interface para a seção da lista
export interface ExercicioSection {
  title: string;
  data: Exercicio[];
}

// Interface para os dados do formulário do plano
export interface PlanoFormParams {
    dia_da_semana: string;
    series: string;
    repeticoes: string;
    notas: string;
}

export const useExerciciosViewModel = () => {
  const [exercicios, setExercicios] = useState<ExercicioSection[]>([]);
  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExercicios = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('grupo_muscular', { ascending: true });

      if (error) throw error;

      // Agrupar exercícios por grupo muscular
      const grouped: { [key: string]: Exercicio[] } = {};
      data.forEach(item => {
        const group = item.grupo_muscular || 'Outros';
        if (!grouped[group]) {
          grouped[group] = [];
        }
        grouped[group].push(item);
      });

      const sections: ExercicioSection[] = Object.keys(grouped).map(key => ({
        title: key,
        data: grouped[key],
      }));

      setExercicios(sections);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os exercícios.');
      console.error('Error fetching exercises:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExercicioById = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setExercicio(data || null);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do exercício.');
      console.error('Error fetching exercise by id:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addExercicioToPlano = useCallback(async (exercicioId: number, form: PlanoFormParams) => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error('Perfil não encontrado');

      const { error } = await supabase.from('plano_treino_usuario').insert({
        usuario_id: profile.id,
        exercicio_id: exercicioId,
        dia_da_semana: parseInt(form.dia_da_semana, 10) || 1,
        series: parseInt(form.series, 10),
        repeticoes: form.repeticoes,
        notas: form.notas,
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Exercício adicionado ao seu plano!');
    } catch (error: any) {
      if (error.code === '23505') { // Código de erro para violação de chave única no PostgreSQL
        Alert.alert('Erro', 'Este exercício já foi adicionado a este dia da semana no seu plano.');
      } else {
        console.error('Error adding exercise to plan:', error.message);
        Alert.alert('Erro', 'Não foi possível adicionar o exercício ao plano.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    exercicios,
    exercicio,
    isLoading,
    fetchExercicios,
    fetchExercicioById,
    addExercicioToPlano,
  };
};