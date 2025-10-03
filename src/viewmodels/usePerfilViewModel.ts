// src/viewmodels/usePerfilViewModel.ts

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AuthService from '../models/authModel';
import { RootStackParamList } from '../navigation/types';
import { getUserProfile } from '../services/saudeService';

// NOVO: Define a estrutura dos dados do usuário
// O '?' torna a propriedade opcional, perfeito para dados que podem ser nulos
interface UserProfile {
  id: number;
  nome?: string;
  email?: string;
  altura?: number;
  peso?: number;
  imc?: number;
  // Adicione outras propriedades que você tiver na tabela 'usuarios'
}

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const usePerfilViewModel = () => {
  // USA A NOVA INTERFACE AQUI
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      setUserData(profile);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  // useFocusEffect é melhor que useEffect para abas, pois recarrega os dados toda vez que o usuário entra na tela
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleLogout = useCallback(async () => {
    const response = await AuthService.signOut();
    if (response.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } else {
      Alert.alert('Erro', response.error || 'Não foi possível deslogar.');
    }
  }, [navigation]);

  return {
    userData,
    loading,
    handleLogout,
    refreshUserData: fetchUserData, // Função para pull-to-refresh, se precisar
  };
};