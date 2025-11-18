// src/viewmodels/useTreinoViewModel.ts
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { AtividadeFisica, mockAtividades } from '../models/treinoModel';
// CORREÇÃO: Importa os tipos do novo arquivo
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Treino'>;

export const useTreinoViewModel = () => {
  const navigation = useNavigation<NavigationProp>();
  const [atividades] = useState<AtividadeFisica[]>(mockAtividades);

  const handleSelectAtividade = (atividade: AtividadeFisica) => {
    if (atividade.id === '1') {
      navigation.navigate('SemanaTreino', {});
    } else {
      console.log('Atividade selecionada:', atividade.nome);
    }
  };

  const handleSelectOutro = () => {
    console.log('Selecionou "Outro"');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return { atividades, handleSelectAtividade, handleSelectOutro, handleGoBack };
};