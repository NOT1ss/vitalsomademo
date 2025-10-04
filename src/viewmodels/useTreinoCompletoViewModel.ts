// src/viewmodels/useTreinoCompletoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import { updateExerciseLog, updatePersonalRecord } from '../services/saudeService';
// CORREÇÃO: Importa os tipos do novo arquivo
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TreinoCompleto'>;
type TreinoCompletoRouteProp = RouteProp<RootStackParamList, 'TreinoCompleto'>;

const useTreinoCompletoViewModel = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TreinoCompletoRouteProp>();
  // O resto do código permanece o mesmo...
  const { dia } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const handleEditar = () => {
    navigation.navigate('EditarTreino', { dia });
  };
  
  const handleSalvarRecorde = async (exercicio: ExercicioCompleto, novoPeso: string) => {
    try {
      // 1. Salva o novo recorde pessoal na tabela 'records'
      await updatePersonalRecord(exercicio.nome, novoPeso);

      // 2. Atualiza o log do treino do dia na tabela 'ficha_treino'
      await updateExerciseLog(exercicio.db_id, { ...exercicio, carga: novoPeso });

      // 3. Prepara a mensagem de popup para a tela anterior
      const pesoAntigo = parseFloat(exercicio.carga.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      const pesoNovo = parseFloat(novoPeso.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      const diferenca = pesoNovo - pesoAntigo;
      const recordeString = `${exercicio.nome} +${diferenca.toFixed(1)} KG`;

      // 4. Exibe alerta de sucesso e navega
      Alert.alert("Sucesso!", "Novo recorde pessoal salvo.", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);

    } catch (error) {
      console.error("Erro ao salvar recorde:", error);
      Alert.alert("Erro", "Não foi possível salvar o novo recorde.");
    }
  };

  return { dia, handleGoBack, handleEditar, handleSalvarRecorde };
};

export default useTreinoCompletoViewModel;