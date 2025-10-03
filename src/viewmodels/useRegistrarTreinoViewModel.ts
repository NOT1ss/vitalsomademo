// src/viewmodels/useRegistrarTreinoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { Alert } from 'react-native';
import { ExercicioCompleto, exercicioPadrao } from '../models/semanaTreinoModel';
// CORREÇÃO: Importa os tipos do novo arquivo
import { RootStackParamList } from '../navigation/types';

type RegistrarTreinoNavProp = StackNavigationProp<RootStackParamList, 'RegistrarTreino'>;
type RegistrarTreinoRouteProp = RouteProp<RootStackParamList, 'RegistrarTreino'>;

export default function useRegistrarTreinoViewModel() {
  const navigation = useNavigation<RegistrarTreinoNavProp>();
  const route = useRoute<RegistrarTreinoRouteProp>();
  // O resto do código permanece o mesmo...
  const { dia, from } = route.params;

  const [exercicios, setExercicios] = useState<ExercicioCompleto[]>(() => {
    return dia.exercicios.length > 0 ? [...dia.exercicios] : [];
  });

  const atualizarExercicio = (exercicioId: string, campo: keyof ExercicioCompleto, valor: string) => {
    setExercicios(prev => 
      prev.map(ex => ex.id === exercicioId ? { ...ex, [campo]: valor } : ex)
    );
  };

  const adicionarExercicio = () => {
    const novoExercicio: ExercicioCompleto = {
      ...exercicioPadrao,
      id: `ex-${Date.now()}`,
    };
    setExercicios(prev => [...prev, novoExercicio]);
  };

  const handleSalvarEVoltar = () => {
    const diaAtualizado = { ...dia, exercicios, status: 'concluido' as const };
    
    if (from === 'EditarTreino') {
        navigation.navigate('EditarTreino', { dia: diaAtualizado, diaAtualizado: diaAtualizado });
    } else {
        navigation.navigate('SemanaTreino', { diaAtualizado });
    }
    
    Alert.alert("Sucesso", "Treino salvo!");
  };

  return { dia, exercicios, adicionarExercicio, atualizarExercicio, handleSalvarEVoltar };
}