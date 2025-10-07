// src/viewmodels/useRegistrarTreinoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState, useCallback } from 'react'; // Adicionado useCallback
import { Alert } from 'react-native';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import { RootStackParamList } from '../navigation/types';
import {
  getPersonalRecords,
  getUserProfile,
  saveExercisesForDate,
  updateDailySummary,
  updatePersonalRecord
} from '../services/saudeService';
import supabase from '../supabaseClient'; // Importar o Supabase
import { PlanoTreinoItem } from './usePlanoSemanaViewModel'; // Importar a interface

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
        setExerciciosPlanejados(data as PlanoTreinoItem[]);
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
    const treinosValidos = exerciciosDoDia.filter(ex => ex.nome.trim() !== '');

    try {
      const dateString = dia.data.toISOString().split('T')[0];
      const profile = await getUserProfile();
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      // O erro estava na chamada a uma função que não existe mais. Foi removida.

      const recordesAtuais = await getPersonalRecords();
      await saveExercisesForDate(dateString, treinosValidos);
      await updateDailySummary(profile.id, { training_completed: treinosValidos.length > 0 }, dateString);

      /* Bloco de atualização de recordes desativado temporariamente.
      for (const exercicio of treinosValidos) {
        const cargaNumerica = parseFloat(exercicio.carga.replace(/[^0-9.]/g, ''));
        if (isNaN(cargaNumerica) || cargaNumerica <= 0) continue;

        const recordeAtualString = recordesAtuais.get(exercicio.nome) || '0';
        const recordeAtualNumerico = parseFloat(recordeAtualString.replace(/[^0-9.]/g, ''));

        if (cargaNumerica > recordeAtualNumerico) {
          await updatePersonalRecord(exercicio.nome, exercicio.carga);
        }
      }
      */
      
      Alert.alert('Sucesso!', 'Seu treino foi salvo.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

    } catch (error) {
      console.error("Erro ao salvar treino e recordes:", error);
      Alert.alert('Erro', 'Não foi possível salvar seu treino.');
    }
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    dia,
    exerciciosDoDia,
    exerciciosPlanejados, // Exporta
    isModalVisible, // Exporta
    setModalVisible, // Exporta
    fetchExerciciosPlanejados, // Exporta
    adicionarExercicioDoPlano, // Exporta
    handleAdicionarExercicio,
    handleAtualizarExercicio,
    handleRemoverExercicio,
    handleSalvarTreino,
    handleGoBack,
  };
}