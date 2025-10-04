// src/viewmodels/useSemanaTreinoViewModel.ts
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { DiaSemana } from '../models/semanaTreinoModel';
import { RootStackParamList } from '../navigation/types';
// CORREÇÃO: O caminho agora aponta para a pasta 'componentes'
import { atualizarDiaNaStore, getDias, inicializarStore } from '../componentes/treinoStore';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SemanaTreino'>;

export function useSemanaTreinoViewModel() {
  const navigation = useNavigation<NavigationProp>();
  
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hoje = new Date();

  useEffect(() => {
    inicializarStore();
    const diasDaStore = getDias();
    setDias(diasDaStore);
    
    const diaDeHoje = diasDaStore[hoje.getDay()];
    setDiaSelecionado(diaDeHoje || diasDaStore[0]);
    setIsLoading(false);
  }, []);

  const atualizarDia = (diaAtualizado: DiaSemana) => {
    const novosDias = atualizarDiaNaStore(diaAtualizado);
    setDias(novosDias);
    setDiaSelecionado(diaAtualizado);
  };

  const handleSelecionarDia = (dia: DiaSemana) => {
    setDiaSelecionado(dia);
  };

  const handleMarcarConcluido = () => {
    if (!diaSelecionado) return;
    if (diaSelecionado.data.setHours(0,0,0,0) < hoje.setHours(0,0,0,0) && diaSelecionado.exercicios.length === 0) {
      Alert.alert("Ação não permitida", "Para marcar um dia passado como concluído, adicione os exercícios clicando em 'Treinar'.");
      return;
    }
    const diaComStatusConcluido = { ...diaSelecionado, status: 'concluido' as const };
    atualizarDia(diaComStatusConcluido);
  };
  
  const handleTreinar = () => {
    if (diaSelecionado) {
      navigation.navigate('RegistrarTreino', { dia: diaSelecionado });
    }
  };

  const handleVerTreino = () => {
    if (diaSelecionado && diaSelecionado.exercicios.length > 0) {
      navigation.navigate('TreinoCompleto', { dia: diaSelecionado });
    } else {
      Alert.alert("Nenhum treino", "Clique em 'Treinar' para registrar os exercícios.");
    }
  };
  
  const handleVerMaisCalendario = () => {
    navigation.navigate('CalendarioCompleto', { dias });
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  return { dias, diaSelecionado, isLoading, atualizarDia, handleMarcarConcluido, handleSelecionarDia, handleGoBack, handleVerTreino, handleTreinar, handleVerMaisCalendario };
};