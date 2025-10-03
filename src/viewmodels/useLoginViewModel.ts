// src/viewmodels/useLoginViewModel.ts

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AuthService from '../models/authModel';
import { RootStackParamList } from '../navigation/types';
import supabase from '../supabaseClient';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export function useLoginViewModel() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password: string): 'fraca' | 'media' | 'forte' => {
    if (password.length < 6) return 'fraca';
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'forte';
    return 'media';
  };

  const login = useCallback(async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'Por favor, preencha seu email e senha.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, digite um email válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.signInWithEmail(email, password);
      if (!response.success) {
        Alert.alert('Erro ao fazer login', response.error || 'Ocorreu um erro desconhecido.');
        setLoading(false); // Garante que o loading para em caso de erro
        return;
      }
      navigation.navigate('MainApp');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [email, password, navigation]);

  const signUp = useCallback(async () => {
    // Validações iniciais
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, digite um email válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // 1. Tenta realizar o cadastro no sistema de autenticação
      const response = await AuthService.signUp(email, password);

      if (!response.success || !response.user) {
        Alert.alert('Erro ao cadastrar', response.error || 'Não foi possível criar o usuário.');
        setLoading(false);
        return;
      }

      // --- INÍCIO DA LÓGICA ADICIONADA ---
      // 2. Se o cadastro funcionou, cria o perfil na tabela 'usuarios'
      
      // Pega a parte do email antes do "@" para usar como um nome padrão
      const defaultName = email.split('@')[0];

      const { error: profileError } = await supabase
        .from('usuarios')
        .insert({
          auth_uuid: response.user.id, // A "ponte" entre a autenticação e seus dados
          email: response.user.email,
          nome: defaultName,
          // Você pode definir outros valores padrão aqui, como peso, altura, etc.
        });

      if (profileError) {
        // Se este erro ocorrer, o usuário existe na autenticação, mas não na sua tabela 'usuarios'
        // É um caso raro, mas importante de notificar.
        console.error("Erro ao criar perfil do usuário:", profileError.message);
        Alert.alert('Erro Crítico', 'Seu usuário foi criado, mas houve um erro ao salvar seu perfil. Por favor, contate o suporte.');
        setLoading(false);
        return;
      }
      // --- FIM DA LÓGICA ADICIONADA ---

      Alert.alert('Sucesso!', 'Seu cadastro foi realizado. Por favor, faça o login.');
      setActiveTab('login'); // Leva o usuário para a aba de login

    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado durante o cadastro.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);



  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('EsqueciSenha');
  }, [navigation]);

  const switchTab = useCallback((tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setPassword('');
    setConfirmPassword('');
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    login,
    signUp,
    showPassword,
    toggleShowPassword,
    activeTab,
    switchTab,
    navigateToForgotPassword,
    checkPasswordStrength,
  };
}