// src/viewmodels/useTreinoCompletoViewModel.ts
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
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
  
  const handleSalvarRecorde = (exercicio: ExercicioCompleto, novoPeso: string) => {
      const pesoAntigo = parseFloat(exercicio.carga.replace('kg', ''));
      const pesoNovo = parseFloat(novoPeso);
      const diferenca = pesoNovo - pesoAntigo;
      const recordeString = `${exercicio.nome} +${diferenca.toFixed(1)} KG`;

      navigation.navigate({
          name: 'SemanaTreino',
          params: { novoRecorde: recordeString },
          merge: true,
      });
  };

  return { dia, handleGoBack, handleEditar, handleSalvarRecorde };
};

export default useTreinoCompletoViewModel;