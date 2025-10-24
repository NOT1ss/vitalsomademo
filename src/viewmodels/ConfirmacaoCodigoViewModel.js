import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';
export default function useConfirmacaoCodigoViewModel() {
  const navigation = useNavigation();
  const [codigo, setCodigo] = useState('');

  const handleConfirmar = async () => {
    if (!codigo) {
      Alert.alert('Erro', 'Por favor, insira o código enviado por e-mail.');
      return;
    }

    try {
      // Aqui, o comportamento depende do fluxo real de autenticação do Supabase.
      // Exemplo de confirmação de código pode variar de acordo com seu backend.
      // Esse trecho é apenas ilustrativo.
      // Você pode adicionar sua lógica de verificação aqui

      Alert.alert('Sucesso', 'Código confirmado! Redirecionando...');
      navigation.navigate('NovaSenha');
    } catch (error) {
      Alert.alert('Erro', 'Código inválido ou expirado.');
    }
  };

  return {
    codigo,
    setCodigo,
    handleConfirmar,
  };
}