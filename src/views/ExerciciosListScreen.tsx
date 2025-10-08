import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useExerciciosViewModel, Exercicio } from '../viewmodels/useExerciciosViewModel';

const ExerciciosListScreen = () => {
  const navigation = useNavigation();
  const { exercicios, isLoading, fetchExercicios } = useExerciciosViewModel();

  useEffect(() => {
    fetchExercicios();
  }, [fetchExercicios]);

  const handleExercicioPress = (exercicioId: number) => {
    // @ts-ignore
    navigation.navigate('ExercicioDetail', { exercicioId });
  };

  const renderItem = ({ item }: { item: Exercicio }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => handleExercicioPress(item.id)}>
      <Text style={styles.itemText}>{item.nome}</Text>
      <Ionicons name="chevron-forward" size={24} color="#1e6a43" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e6a43" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de Exercícios</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PlanoSemana')}>
          <Ionicons name="calendar-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={exercicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e6a43',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 15,
    paddingLeft: 5,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemText: { fontSize: 16, fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
});

export default ExerciciosListScreen;