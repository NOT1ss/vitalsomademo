
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useReceitasSupabaseViewModel } from '../viewmodels/useReceitasSupabaseViewModel';
import { RootStackParamList } from '../navigation/types';

// Tipagem da rota
type ReceitaDetailScreenRouteProp = RouteProp<RootStackParamList, 'ReceitaDetail'>;

const ReceitaDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ReceitaDetailScreenRouteProp>();
  const { receitaId } = route.params;

  const { receita, isLoading, fetchReceitaPorId } = useReceitasSupabaseViewModel();

  useEffect(() => {
    if (receitaId) {
      fetchReceitaPorId(receitaId);
    }
  }, [receitaId]);

  if (isLoading || !receita) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <ActivityIndicator size="large" color="#1e6a43" />
      </SafeAreaView>
    );
  }

  // Funções para processar os textos de ingredientes e preparo
  const ingredientesList = receita.ingredientes_pt.split('\n').filter(item => item.trim() !== '');
  const preparoList = receita.preparo_pt.split('\n').filter(item => item.trim() !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Imagem e Título */}
        <View style={styles.titleContainer}>
          <Image source={{ uri: receita.imagem_url }} style={styles.image} />
          <Text style={styles.title}>{receita.titulo_pt}</Text>
        </View>

        {/* Descrição */}
        {receita.descricao && (
            <Text style={styles.description}>{receita.descricao}</Text>
        )}

        {/* Modo de Preparo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Modo de Preparo</Text>
          {preparoList.map((item, index) => (
            <Text key={index} style={styles.listItem}>{` ${index + 1}. ${item}`}</Text>
          ))}
        </View>

        {/* Ingredientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Ingredientes</Text>
          {ingredientesList.map((item, index) => (
            <Text key={index} style={styles.listItem}>{`• ${item}`}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeAreaLoading: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 30
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: -40, // Move o título para cima da imagem
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    textAlign: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 20,
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1e6a43',
    paddingLeft: 10,
  },
  listItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    lineHeight: 24,
  },
});

export default ReceitaDetailScreen;
