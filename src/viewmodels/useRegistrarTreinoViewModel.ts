// src/viewmodels/useRegistrarTreinoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
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

type RegistrarTreinoRouteProp = RouteProp<RootStackParamList, 'RegistrarTreino'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'RegistrarTreino'>;

export function useRegistrarTreinoViewModel() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RegistrarTreinoRouteProp>();
  const { dia } = route.params;

  const [exerciciosDoDia, setExerciciosDoDia] = useState<ExercicioCompleto[]>(dia.exercicios || []);

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
    handleAdicionarExercicio,
    handleAtualizarExercicio,
    handleRemoverExercicio,
    handleSalvarTreino,
    handleGoBack,
  };
}