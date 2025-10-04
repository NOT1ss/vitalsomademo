// src/views/RegistrarTreinoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import { useRegistrarTreinoViewModel } from '../viewmodels/useRegistrarTreinoViewModel';

const ExercicioInputCard = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: ExercicioCompleto;
  onUpdate: (id: string, campo: keyof ExercicioCompleto, valor: string) => void;
  onRemove: () => void;
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextInput
          style={styles.inputNome}
          placeholder="Nome do Exercício"
          placeholderTextColor="#999"
          defaultValue={item.nome}
          onChangeText={(text) => onUpdate(item.id, 'nome', text)}
        />
        <TouchableOpacity onPress={onRemove} style={styles.removerExercicioBtn}>
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Séries</Text>
          <TextInput
            style={styles.inputDetalhe}
            placeholder="Ex: 4"
            placeholderTextColor="#bbb"
            defaultValue={item.series}
            keyboardType="numeric"
            onChangeText={(text) => onUpdate(item.id, 'series', text)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Repetições</Text>
          <TextInput
            style={styles.inputDetalhe}
            placeholder="Ex: 10-12"
            placeholderTextColor="#bbb"
            defaultValue={item.repeticoes}
            keyboardType="numeric"
            onChangeText={(text) => onUpdate(item.id, 'repeticoes', text)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Carga</Text>
          <TextInput
            style={styles.inputDetalhe}
            placeholder="Ex: 20kg"
            placeholderTextColor="#bbb"
            defaultValue={item.carga}
            keyboardType="numeric"
            onChangeText={(text) => onUpdate(item.id, 'carga', text)}
          />
        </View>
      </View>
    </View>
  );
};

export default function RegistrarTreinoScreen() {
  // Este hook agora retorna apenas as funções que realmente existem
  const {
    dia,
    exerciciosDoDia,
    handleAdicionarExercicio,
    handleAtualizarExercicio,
    handleRemoverExercicio,
    handleSalvarTreino,
    handleGoBack,
  } = useRegistrarTreinoViewModel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Treino de {dia.diaCompleto}</Text>
        </View>

        <FlatList
          data={exerciciosDoDia}
          keyExtractor={(item) => item.id}
          // As chamadas aqui estão corretas, usando as funções do ViewModel
          renderItem={({ item, index }) => (
            <ExercicioInputCard
              item={item}
              onUpdate={handleAtualizarExercicio}
              onRemove={() => handleRemoverExercicio(index)}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.addButton} onPress={handleAdicionarExercicio}>
              <Ionicons name="add" size={28} color="#1e6a43" />
              <Text style={styles.addButtonText}>Adicionar Exercício</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        {/* O botão de salvar chama a função correta */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSalvarTreino}>
          <Text style={styles.saveButtonText}>Salvar Treino</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginHorizontal: 20, marginVertical: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
  inputNome: { fontSize: 18, fontWeight: 'bold', flex: 1, color: '#333' },
  removerExercicioBtn: { padding: 5 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { flex: 1, marginHorizontal: 5 },
  inputLabel: { fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' },
  inputDetalhe: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingVertical: 10, textAlign: 'center', color: '#333', borderWidth: 1, borderColor: '#eee' },
  addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9', borderRadius: 12, padding: 15, marginHorizontal: 20, marginTop: 10, borderWidth: 1, borderColor: '#1e6a43', borderStyle: 'dashed' },
  addButtonText: { marginLeft: 10, color: '#1e6a43', fontWeight: 'bold' },
  saveButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#16A34A', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 3 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});