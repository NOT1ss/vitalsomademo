// src/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
// CORREÇÃO: Importa os tipos do novo arquivo
import { RootStackParamList } from './types';

// Telas
import AlimentosScreen from '../views/AlimentosScreen';
import CalendarioCompletoScreen from '../views/CalendarioCompletoScreen';
import ConfirmacaoCodigoScreen from '../views/ConfirmacaoCodigoScreen';
import EditarTreinoScreen from '../views/EditarTreinoScreen';
import EsqueciSenhaScreen from '../views/EsqueciSenhaScreen';
import LoginView from '../views/LoginView';
import NovaSenhaScreen from '../views/NovaSenhaScreen';
import ReceitasScreen from '../views/ReceitasScreen';
import RegistrarTreinoScreen from '../views/RegistrarTreinoScreen';
import SemanaTreinoScreen from '../views/SemanaTreinoScreen';
import SucessoSenhaScreen from '../views/SucessoSenhaScreen';
import TreinoCompletoScreen from '../views/TreinoCompletoScreen';
import TreinoScreen from '../views/TreinoScreen';
import WelcomeView from '../views/WelcomeView';
import MainTabNavigator from './MainTabNavigator';

import ReceitaDetailScreen from '../views/ReceitaDetailScreen';
import ReceitasFavoritasScreen from '../views/ReceitasFavoritasScreen';
import ReceitasListScreen from '../views/ReceitasListScreen';
import ExerciciosListScreen from '../views/ExerciciosListScreen';
import ExercicioDetailScreen from '../views/ExercicioDetailScreen';
import PlanoSemanaScreen from '../views/PlanoSemanaScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeView} />
      <Stack.Screen name="Login" component={LoginView} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
      <Stack.Screen name="ConfirmacaoCodigo" component={ConfirmacaoCodigoScreen} />
      <Stack.Screen name="NovaSenha" component={NovaSenhaScreen} />
      <Stack.Screen name="Sucesso" component={SucessoSenhaScreen} />
      <Stack.Screen name="Treino" component={TreinoScreen} />
      <Stack.Screen name="SemanaTreino" component={SemanaTreinoScreen} />
      <Stack.Screen name="TreinoCompleto" component={TreinoCompletoScreen} />
      <Stack.Screen name="CalendarioCompleto" component={CalendarioCompletoScreen} />
      <Stack.Screen name="EditarTreino" component={EditarTreinoScreen} />
      <Stack.Screen name="RegistrarTreino" component={RegistrarTreinoScreen} />
      <Stack.Screen name="Alimentos" component={AlimentosScreen} />
      <Stack.Screen name="Receitas" component={ReceitasScreen} />
      <Stack.Screen name="ReceitasList" component={ReceitasListScreen} />
      <Stack.Screen name="ReceitaDetail" component={ReceitaDetailScreen} />
      <Stack.Screen name="ReceitasFavoritas" component={ReceitasFavoritasScreen} />
      <Stack.Screen name="ExerciciosList" component={ExerciciosListScreen} />
      <Stack.Screen name="ExercicioDetail" component={ExercicioDetailScreen} />
      <Stack.Screen name="PlanoSemana" component={PlanoSemanaScreen} />
      <Stack.Screen name="MainApp" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}
