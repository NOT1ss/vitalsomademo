import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';

export default function useNovaSenhaViewModel() {
  const navigation = useNavigation();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleConfirmar = async () => {
    if (!senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      // Aqui entra a lógica de atualização de senha no seu backend
      // Exemplo para Supabase (precisa de token ou session válida)

      Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
      navigation.navigate('Sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível redefinir a senha.');
    }
  };

  return {
    senha,
    confirmarSenha,
    setSenha,
    setConfirmarSenha,
    handleConfirmar,
  };
}
