// src/viewmodels/usePerfilViewModel.ts
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { PerfilUsuario } from '../models/perfilModel';
import { RootStackParamList } from '../navigation/types';
import { calculateTrainingStreak, deletePersonalRecord, getPersonalRecords, getUserProfile, updateUserProfile, uploadAvatar } from '../services/saudeService';
import supabase from '../supabaseClient';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type ImcCategory = 'bom' | 'regular' | 'ruim' | null;

export const usePerfilViewModel = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calorieGoalInput, setCalorieGoalInput] = useState('');
  const [alturaInput, setAlturaInput] = useState('');
  const [pesoInput, setPesoInput] = useState('');
  const [pesoMetaInput, setPesoMetaInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [trainingStreak, setTrainingStreak] = useState(0);
  const [personalRecords, setPersonalRecords] = useState<[string, string][]>([]);
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [nomeInput, setNomeInput] = useState('');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const [userProfile, streak, records] = await Promise.all([
        getUserProfile(),
        calculateTrainingStreak(),
        getPersonalRecords(),
      ]);

      setProfile(userProfile);
      setTrainingStreak(streak);
      setPersonalRecords(Array.from(records.entries()));

      setCalorieGoalInput(userProfile?.daily_calorie_goal?.toString() || '');
      setAlturaInput(userProfile?.altura?.toString() || '');
      setPesoInput(userProfile?.peso?.toString() || '');
      setPesoMetaInput(userProfile?.peso_meta?.toString() || '');
      setNomeInput(userProfile?.nome || '');
      setNewAvatarUri(userProfile?.avatar_url || null);

    } catch (error) {
      console.error('Erro ao buscar dados do perfil e conquistas:', error);
      Alert.alert('Erro', 'Não foi possível carregar todos os dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleOpenEditModal = () => {
    if (profile) {
      setNomeInput(profile.nome || '');
      setNewAvatarUri(profile.avatar_url || null);
      setEditModalVisible(true);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "É preciso permitir o acesso à galeria!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Solicita o base64 da imagem
    });

    if (!pickerResult.canceled && pickerResult.assets[0].base64) {
      // Prepara o URI de dados para exibição e upload
      const uri = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;
      setNewAvatarUri(uri);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;
    let avatarUrl = profile.avatar_url;
    setIsSaving(true);
    try {
      if (newAvatarUri && newAvatarUri !== profile.avatar_url) {
        avatarUrl = await uploadAvatar(newAvatarUri);
      }
      const updates = { nome: nomeInput, avatar_url: avatarUrl };
      await updateUserProfile(updates);
      await fetchProfile();
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado.');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    const newGoal = parseInt(calorieGoalInput, 10);
    const newAltura = parseFloat(alturaInput.replace(',', '.'));
    const newPeso = parseFloat(pesoInput.replace(',', '.'));
    const newPesoMeta = parseFloat(pesoMetaInput.replace(',', '.'));

    if (isNaN(newGoal) || newGoal <= 0 || isNaN(newAltura) || newAltura <= 0 || isNaN(newPeso) || newPeso <= 0 || isNaN(newPesoMeta) || newPesoMeta <= 0) {
      Alert.alert('Valores inválidos', 'Por favor, insira números válidos para todos os campos.');
      return;
    }
    const newImc = newPeso / (newAltura * newAltura);
    try {
      setIsSaving(true);
      await updateUserProfile({
        daily_calorie_goal: newGoal,
        altura: newAltura,
        peso: newPeso,
        peso_meta: newPesoMeta,
        imc: newImc,
      });
      await fetchProfile();
      Alert.alert('Sucesso!', 'Seus dados foram atualizados.');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (exerciseName: string) => {
    Alert.alert(
      'Deletar Recorde',
      `Tem certeza que deseja deletar o recorde de "${exerciseName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePersonalRecord(exerciseName);
              setPersonalRecords(currentRecords =>
                currentRecords.filter(record => record[0] !== exerciseName)
              );
              Alert.alert('Sucesso', 'Recorde deletado.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o recorde.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Não foi possível deslogar.');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  };

  const calculatedImc = useMemo(() => {
    if (profile?.altura && profile?.peso && profile.altura > 0) {
      return profile.peso / (profile.altura * profile.altura);
    }
    return null;
  }, [profile]);

  const imcCategory = useMemo((): ImcCategory => {
    if (!calculatedImc) return null;
    if (calculatedImc < 18.5) return 'ruim';
    if (calculatedImc < 25) return 'bom';
    if (calculatedImc < 30) return 'regular';
    return 'ruim';
  }, [calculatedImc]);

  const top3Records = useMemo(() => {
    return [...personalRecords]
      .sort((a, b) => {
        const valueA = parseFloat(a[1].replace(/[^0-9.,]/g, '')) || 0;
        const valueB = parseFloat(b[1].replace(/[^0-9.,]/g, '')) || 0;
        return valueB - valueA;
      })
      .slice(0, 3);
  }, [personalRecords]);

  return {
    userData: profile,
    loading: isLoading,
    calorieGoalInput,
    setCalorieGoalInput,
    alturaInput,
    setAlturaInput,
    pesoInput,
    setPesoInput,
    pesoMetaInput,
    setPesoMetaInput,
    isSaving,
    handleSaveChanges,
    handleLogout,
    handleDeleteRecord,
    calculatedImc,
    imcCategory,
    trainingStreak,
    top3Records,
    isEditModalVisible,
    setEditModalVisible,
    nomeInput,
    setNomeInput,
    newAvatarUri,
    handleOpenEditModal,
    handlePickImage,
    handleProfileUpdate,
  };
};