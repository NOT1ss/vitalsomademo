import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useExerciciosViewModel, PlanoFormParams } from '../viewmodels/useExerciciosViewModel';
import { RootStackParamList } from '../navigation/types';
import OptimizedImage from '../componentes/OptimizedImage';

// Tipagem da rota
type ExercicioDetailScreenRouteProp = RouteProp<RootStackParamList, 'ExercicioDetail'>;

const ExercicioDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ExercicioDetailScreenRouteProp>();
  const { exercicioId } = route.params;

  const { exercicio, isLoading, fetchExercicioById, addExercicioToPlano } = useExerciciosViewModel();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState<PlanoFormParams>({ dia_da_semana: '', series: '', repeticoes: '', notas: '' });

  useEffect(() => {
    if (exercicioId) {
      fetchExercicioById(exercicioId);
    }
  }, [exercicioId]);

  const handleAddAoTreino = async () => {
    if (!exercicio) return;
    await addExercicioToPlano(exercicio.id, form);
    setIsModalVisible(false);
  };

  if (isLoading || !exercicio) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e6a43" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1e6a43" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{exercicio.nome}</Text>
        </View>

        {exercicio.imagem_url && (
          <OptimizedImage source={{ uri: exercicio.imagem_url }} style={styles.image} />
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.group}>{exercicio.grupo_muscular}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.sectionText}>{exercicio.descricao}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instruções</Text>
            <Text style={styles.sectionText}>{exercicio.instrucoes}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar ao Treino</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsModalVisible(false)}>
              <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>Adicionar ao Plano</Text>
                      <TextInput style={styles.input} placeholder="Dia da Semana (Ex: 1 para Segunda)" placeholderTextColor="#999" keyboardType="numeric" value={form.dia_da_semana} onChangeText={text => setForm(f => ({ ...f, dia_da_semana: text }))} />
                      <TextInput style={styles.input} placeholder="Número de Séries (Ex: 3)" placeholderTextColor="#999" keyboardType="numeric" value={form.series} onChangeText={text => setForm(f => ({ ...f, series: text }))} />
                      <TextInput style={styles.input} placeholder="Repetições (Ex: 8-12)" placeholderTextColor="#999" keyboardType="numeric" value={form.repeticoes} onChangeText={text => setForm(f => ({ ...f, repeticoes: text }))} />
                      <TextInput style={styles.input} placeholder="Notas (Ex: Aumentar peso na próxima)" placeholderTextColor="#999" value={form.notas} onChangeText={text => setForm(f => ({ ...f, notas: text }))} />
                      <TouchableOpacity style={styles.saveButton} onPress={handleAddAoTreino}>
                          <Text style={styles.saveButtonText}>Salvar</Text>
                      </TouchableOpacity>
                  </View>
              </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee'
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  image: { width: '100%', height: 250 },
  contentContainer: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  group: { fontSize: 16, color: 'gray', marginBottom: 20, textTransform: 'uppercase' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1e6a43' },
  sectionText: { fontSize: 16, lineHeight: 24 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  addButton: { backgroundColor: '#1e6a43', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 15 },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  // Modal Styles
  keyboardAvoidingView: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#1e6a43', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ExercicioDetailScreen;