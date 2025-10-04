// src/viewmodels/usePerfilViewModel.ts
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { PerfilUsuario } from '../models/perfilModel';
import { RootStackParamList } from '../navigation/types';
import { getUserProfile, updateUserProfile } from '../services/saudeService';
import supabase from '../supabaseClient'; // Importe o Supabase para o logout

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const usePerfilViewModel = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calorieGoalInput, setCalorieGoalInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile();
      setProfile(userProfile);
      setCalorieGoalInput(userProfile?.daily_calorie_goal?.toString() || '');
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveChanges = async () => {
    const newGoal = parseInt(calorieGoalInput, 10);
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Valor inválido', 'Por favor, insira um número válido.');
      return;
    }

    try {
      setIsSaving(true);
      // Usando o nome correto da coluna
      await updateUserProfile({ daily_calorie_goal: newGoal });
      
      // Força a busca dos dados atualizados do servidor
      await fetchProfile(); 
      
      Alert.alert('Sucesso!', 'Sua meta de calorias foi atualizada.');
    } catch (error) {
      console.error('Erro ao salvar a meta de calorias:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Função de logout que você já tinha
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Não foi possível deslogar.');
    } else {
      // Navega de volta para a tela de Welcome ou Login após o logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  };

  return {
    // Renomeando 'profile' para 'userData' para manter a consistência com sua tela
    userData: profile,
    loading: isLoading,
    calorieGoalInput,
    setCalorieGoalInput,
    isSaving,
    handleSaveChanges,
    handleLogout,
  };
};