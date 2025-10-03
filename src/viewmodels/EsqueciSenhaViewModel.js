import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import supabase from '../supabaseClient';

export default function useEsqueciSenhaViewModel() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      Alert.alert(
        'Recuperação de Senha',
        'Se o e-mail informado estiver cadastrado, enviamos as instruções de recuperação.'
      );
      navigation.navigate('ConfirmacaoCodigo');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return {
    email,
    setEmail,
    handleSend,
    handleBackToLogin,
  };
}
