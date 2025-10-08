// src/viewmodels/useEditarTreinoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import { RootStackParamList } from '../navigation/types';
import { deleteSingleExercise, getUserProfile, updateDailySummary } from '../services/saudeService';

type EditarTreinoNavProp = StackNavigationProp<RootStackParamList, 'EditarTreino'>;
type EditarTreinoRouteProp = RouteProp<RootStackParamList, 'EditarTreino'>;

// Helper para garantir a formatação de data consistente
const toDateString = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function useEditarTreinoViewModel() {
    const navigation = useNavigation<EditarTreinoNavProp>();
    const route = useRoute<EditarTreinoRouteProp>();
    const { dia } = route.params;

    const [exercicios, setExercicios] = useState<ExercicioCompleto[]>([...dia.exercicios]);
    
    useEffect(() => {
        if (route.params?.diaAtualizado) {
            setExercicios(route.params.diaAtualizado.exercicios);
            navigation.setParams({ diaAtualizado: undefined });
        }
    }, [route.params?.diaAtualizado]);

    const handleRemoverExercicio = (db_id: number, client_id: string) => {
      Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir este exercício? Esta ação é permanente.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          { 
            text: "Sim, Excluir", 
            onPress: async () => {
              try {
                // 1. Apaga o exercício da lista de exercícios
                await deleteSingleExercise(db_id);

                // 2. Verifica se era o último exercício
                if (exercicios.length === 1) {
                  // 3. Se for o último, desmarca o dia como 'concluído'
                  const profile = await getUserProfile();
                  if (profile) {
                      const dateString = toDateString(dia.data);
                      await updateDailySummary(profile.id, { training_completed: false }, dateString);
                  }
                  
                  // 4. Mostra o alerta e volta 2 telas
                  Alert.alert("Sucesso", "Exercício final do dia removido.", [
                    { text: "OK", onPress: () => navigation.pop(2) }
                  ]);
                } else {
                  // Se não for o último, apenas atualiza a UI local
                  setExercicios(prev => prev.filter(ex => ex.id !== client_id));
                  Alert.alert("Sucesso", "Exercício excluído.");
                }
              } catch (error) {
                console.error("Erro ao excluir exercício:", error);
                Alert.alert("Erro", "Não foi possível excluir o exercício.");
              }
            },
            style: "destructive"
          }
        ]
      );
    };
    
    const handleAdicionarExercicio = () => {
        const diaComExerciciosAtuais = { ...dia, exercicios };
        navigation.navigate('RegistrarTreino', { dia: diaComExerciciosAtuais, from: 'EditarTreino' });
    };

    return { dia, exercicios, handleAdicionarExercicio, handleRemoverExercicio };
}