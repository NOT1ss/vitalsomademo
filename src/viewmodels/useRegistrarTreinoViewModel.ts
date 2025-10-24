// src/viewmodels/useRegistrarTreinoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import { RootStackParamList } from '../navigation/types';
import {
  addPoints,
  calculateTrainingStreak, // Importar
  getDailySummary,
  getPersonalRecords,
  getUserProfile,
  getTodayDateString,
  saveExercisesForDate,
  updateDailySummary,
  updatePersonalRecord
} from '../services/saudeService';
import supabase from '../supabaseClient';
import { PlanoTreinoItem } from './usePlanoSemanaViewModel';

type RegistrarTreinoRouteProp = RouteProp<RootStackParamList, 'RegistrarTreino'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'RegistrarTreino'>;

export function useRegistrarTreinoViewModel() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegistrarTreinoRouteProp>();
  const { dia } = route.params;

  const [exerciciosDoDia, setExerciciosDoDia] = useState<ExercicioCompleto[]>(dia.exercicios || []);
  const [exerciciosPlanejados, setExerciciosPlanejados] = useState<PlanoTreinoItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  // Função para buscar os exercícios planejados para o dia da semana
  const fetchExerciciosPlanejados = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error('Perfil não encontrado');

      const diaDaSemana = dia.data.getDay(); // 0 para Domingo, 1 para Segunda, etc.

      const { data, error } = await supabase
        .from('plano_treino_usuario')
        .select(`
          id, dia_da_semana, series, repeticoes, notas,
          exercicio:exercicios (*)
        `)
        .eq('usuario_id', profile.id)
        .eq('dia_da_semana', diaDaSemana);

      if (error) throw error;

      if (data && data.length > 0) {
        const planoItems: PlanoTreinoItem[] = data.map(item => ({
          id: item.id,
          dia_da_semana: item.dia_da_semana,
          series: item.series,
          repeticoes: item.repeticoes,
          notas: item.notas,
          exercicio: Array.isArray(item.exercicio) ? item.exercicio[0] : item.exercicio
        }));
        setExerciciosPlanejados(planoItems);
        setModalVisible(true);
      } else {
        Alert.alert('Nenhum Exercício', 'Você não tem exercícios planejados para este dia da semana.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível buscar os exercícios planejados.');
      console.error(error.message);
    }
  }, [dia.data]);

  // Adiciona um exercício do plano ao treino do dia
  const adicionarExercicioDoPlano = (exercicioPlanejado: PlanoTreinoItem) => {
    const novoExercicio: ExercicioCompleto = {
      id: Date.now().toString(),
      nome: exercicioPlanejado.exercicio.nome,
      series: exercicioPlanejado.series.toString(),
      repeticoes: exercicioPlanejado.repeticoes,
      carga: '', // Carga fica vazia para o usuário preencher
      imagem: require('../../assets/images/image 40.png'), // Usar uma imagem padrão
    };
    setExerciciosDoDia(prev => [...prev, novoExercicio]);
    setModalVisible(false); // Fecha o modal após adicionar
  };


  const handleAdicionarExercicio = () => {
    const novoExercicio: ExercicioCompleto = {
      id: Date.now().toString(),
      nome: '',
      series: '',
      repeticoes: '',
      carga: '',
      imagem: require('../../assets/images/image 40.png'),
    };
    setExerciciosDoDia([...exerciciosDoDia, novoExercicio]);
  };

  const handleAtualizarExercicio = (id: string, campo: keyof ExercicioCompleto, valor: string) => {
    let valorFiltrado = valor;
    if (campo === 'series' || campo === 'repeticoes' || campo === 'carga') {
      // Permite apenas números e um separador decimal (ponto ou vírgula)
      valorFiltrado = valor.replace(/[^0-9.,]/g, '');
    }

    const novosExercicios = exerciciosDoDia.map(ex => {
      if (ex.id === id) {
        return { ...ex, [campo]: valorFiltrado };
      }
      return ex;
    });
    setExerciciosDoDia(novosExercicios);
  };

  const handleRemoverExercicio = (index: number) => {
    const novosExercicios = [...exerciciosDoDia];
    novosExercicios.splice(index, 1);
    setExerciciosDoDia(novosExercicios);
  };

  const handleSalvarTreino = async () => {
    // Validações
    if (exerciciosDoDia.length === 0) {
      Alert.alert('Nenhum exercício', 'Adicione pelo menos um exercício antes de salvar.');
      return;
    }
    const exerciciosInvalidos = exerciciosDoDia.filter(ex => ex.nome.trim() === '');
    if (exerciciosInvalidos.length > 0) {
      Alert.alert('Exercícios incompletos', 'Preencha o nome de todos os exercícios.');
      return;
    }

    const treinosValidos = exerciciosDoDia;

    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error("Perfil não encontrado");

      const workoutDate = new Date(dia.data);
      const year = workoutDate.getFullYear();
      const month = (workoutDate.getMonth() + 1).toString().padStart(2, '0');
      const day = workoutDate.getDate().toString().padStart(2, '0');
      const workoutDateString = `${year}-${month}-${day}`;
      
      const todayString = getTodayDateString();
      const summary = await getDailySummary(todayString);
      const shouldAwardPoints = workoutDateString === todayString && !summary.trainingCompleted;

      // Salva o treino e atualiza o status do dia
      await saveExercisesForDate(workoutDateString, treinosValidos);
      await updateDailySummary(profile.id, { training_completed: treinosValidos.length > 0 }, workoutDateString);

      // --- LÓGICA DE PONTUAÇÃO ---
      if (shouldAwardPoints) {
        console.log('[handleSalvarTreino] Adicionando 10 pontos por completar o treino do dia.');
        await addPoints(profile.id, 10);

        // Calcula a ofensiva (streak) APÓS o treino de hoje ser computado
        const streak = await calculateTrainingStreak();
        console.log(`[handleSalvarTreino] Sequência de treino atual: ${streak} dias.`);

        // Adiciona 5 pontos de bônus a partir do segundo dia de ofensiva
        if (streak >= 2) {
          console.log(`[handleSalvarTreino] Adicionando 5 pontos de ofensiva.`);
          await addPoints(profile.id, 5);
        }

        // Adiciona 50 pontos de bônus a cada 7 dias de ofensiva
        if (streak > 0 && streak % 7 === 0) {
          console.log(`[handleSalvarTreino] Adicionando 50 pontos de bônus por ${streak} dias.`);
          await addPoints(profile.id, 50);
        }
      }
      // --- FIM DA LÓGICA DE PONTUAÇÃO ---
      
      Alert.alert('Sucesso!', 'Seu treino foi salvo.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

    } catch (error: any) {
      console.error("[handleSalvarTreino] Erro detalhado ao salvar treino:", error);
      // Lógica para lidar com sessão expirada
      if (error.message.includes('Usuário não autenticado') || error.message.includes('Perfil não encontrado')) {
        Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça o login novamente.', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar seu treino.');
      }
    }
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    dia,
    exerciciosDoDia,
    exerciciosPlanejados,
    isModalVisible,
    setModalVisible,
    fetchExerciciosPlanejados,
    adicionarExercicioDoPlano,
    handleAdicionarExercicio,
    handleAtualizarExercicio,
    handleRemoverExercicio,
    handleSalvarTreino,
    handleGoBack,
  };
}