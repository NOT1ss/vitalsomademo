// src/views/TreinoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

// Definindo o tipo para cada atividade para facilitar a renderização
type Atividade = {
  nome: 'Academia' | 'Corrida' | 'Caminhada' | 'Ciclismo';
  icone: keyof typeof Ionicons.glyphMap; // Garante que o ícone exista
  onPress: () => void;
};

export default function TreinoScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Ações de clique dos botões
  const handlePress = (atividade: 'Academia' | 'Corrida' | 'Caminhada' | 'Ciclismo') => {
    if (atividade === 'Academia') {
      navigation.navigate('SemanaTreino');
    } else if (atividade === 'Corrida') {
      navigation.navigate('ActivityList', { tipo_atividade: 'corrida' });
    } else if (atividade === 'Caminhada') {
      navigation.navigate('ActivityList', { tipo_atividade: 'caminhada' });
    } else if (atividade === 'Ciclismo') {
      navigation.navigate('ActivityList', { tipo_atividade: 'ciclismo' });
    } else {
      console.log(`${atividade} pressionado`);
    }
  };

  const atividades: Atividade[] = [
    { nome: 'Academia', icone: 'barbell', onPress: () => handlePress('Academia') },
    { nome: 'Caminhada', icone: 'walk', onPress: () => handlePress('Caminhada') },
    { nome: 'Ciclismo', icone: 'bicycle', onPress: () => handlePress('Ciclismo') },
    { nome: 'Corrida', icone: 'walk', onPress: () => handlePress('Corrida') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Atividades físicas</Text>
        </View>

        {/* Botões de Atividade */}
        <View style={styles.buttonsContainer}>
          {atividades.map((atividade) => (
            <TouchableOpacity
              key={atividade.nome}
              style={styles.activityButton}
              onPress={atividade.onPress}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={atividade.icone} size={32} color="#005A4A" />
              </View>
              <Text style={styles.activityText}>{atividade.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50, // Empurra o bloco de botões para baixo
    gap: 20, // Mantém o espaço entre os botões
  },
  activityButton: {
    backgroundColor: '#005A4A',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  activityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});