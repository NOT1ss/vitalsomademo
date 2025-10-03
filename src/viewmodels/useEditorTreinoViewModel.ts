// src/viewmodels/useEditarTreinoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
// CORREÇÃO: Importa os tipos do novo arquivo
import { RootStackParamList } from '../navigation/types';

type EditarTreinoNavProp = StackNavigationProp<RootStackParamList, 'EditarTreino'>;
type EditarTreinoRouteProp = RouteProp<RootStackParamList, 'EditarTreino'>;

export default function useEditarTreinoViewModel() {
    const navigation = useNavigation<EditarTreinoNavProp>();
    const route = useRoute<EditarTreinoRouteProp>();
    // O resto do código permanece o mesmo...
    const { dia } = route.params;

    const [exercicios, setExercicios] = useState<ExercicioCompleto[]>([...dia.exercicios]);
    
    useEffect(() => {
        if (route.params?.diaAtualizado) {
            setExercicios(route.params.diaAtualizado.exercicios);
            navigation.setParams({ diaAtualizado: undefined });
        }
    }, [route.params?.diaAtualizado]);

    const handleRemoverExercicio = (id: string) => {
      setExercicios(prev => prev.filter(ex => ex.id !== id))
    };
    
    const handleAdicionarExercicio = () => {
        const diaComExerciciosAtuais = { ...dia, exercicios };
        navigation.navigate('RegistrarTreino', { dia: diaComExerciciosAtuais, from: 'EditarTreino' });
    };

    const handleSalvar = () => {
        const diaAtualizado = { ...dia, exercicios };
        navigation.navigate('SemanaTreino', { diaAtualizado });
        Alert.alert("Sucesso", "Alterações salvas!");
    };

    return { dia, exercicios, handleAdicionarExercicio, handleRemoverExercicio, handleSalvar };
}