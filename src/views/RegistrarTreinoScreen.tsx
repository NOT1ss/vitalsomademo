// src/views/RegistrarTreinoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import useRegistrarTreinoViewModel from '../viewmodels/useRegistrarTreinoViewModel';

const ExercicioInputCard = ({ item, onUpdate }: { item: any; onUpdate: (id: string, campo: any, valor: string) => void; }) => {
  return (
    <View style={styles.card}>
      <TextInput
        style={styles.inputNome}
        placeholder="Nome do Exercício"
        defaultValue={item.nome}
        onChangeText={(text) => onUpdate(item.id, 'nome', text)}
      />
      <View style={styles.detailsRow}>
        <TextInput
          style={styles.inputDetalhe}
          placeholder="Séries"
          defaultValue={item.series}
          keyboardType="numeric"
          onChangeText={(text) => onUpdate(item.id, 'series', text)}
        />
        <TextInput
          style={styles.inputDetalhe}
          placeholder="Reps"
          defaultValue={item.repeticoes}
          keyboardType="numeric"
          onChangeText={(text) => onUpdate(item.id, 'repeticoes', text)}
        />
        <TextInput
          style={styles.inputDetalhe}
          placeholder="Carga (kg)"
          defaultValue={item.carga}
          keyboardType="numeric"
          onChangeText={(text) => onUpdate(item.id, 'carga', text)}
        />
      </View>
    </View>
  );
};

export default function RegistrarTreinoScreen() {
  const navigation = useNavigation();
  const {
    dia,
    exercicios,
    adicionarExercicio,
    atualizarExercicio,
    handleSalvarEVoltar,
  } = useRegistrarTreinoViewModel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Treino de {dia.diaCompleto}</Text>
        </View>

        <FlatList
          data={exercicios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExercicioInputCard item={item} onUpdate={atualizarExercicio} />}
          ListFooterComponent={
            <TouchableOpacity style={styles.addButton} onPress={adicionarExercicio}>
              <Ionicons name="add" size={28} color="#1e6a43" />
              <Text style={styles.addButtonText}>Adicionar Exercício</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSalvarEVoltar}>
          <Text style={styles.saveButtonText}>Salvar e Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginHorizontal: 20, marginVertical: 10, elevation: 2 },
  inputNome: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputDetalhe: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10, marginRight: 10, textAlign: 'center' },
  addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: 12, padding: 15, marginHorizontal: 20, marginTop: 10 },
  addButtonText: { marginLeft: 10, color: '#1e6a43', fontWeight: 'bold' },
  saveButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#16A34A', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 3 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

