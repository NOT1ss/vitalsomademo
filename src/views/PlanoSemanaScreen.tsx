import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActionSheetIOS,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { usePlanoSemanaViewModel, PlanoTreinoItem } from '../viewmodels/usePlanoSemanaViewModel';
import { PlanoFormParams } from '../viewmodels/useExerciciosViewModel';

const PlanoSemanaScreen = () => {
  const navigation = useNavigation();
  const { plano, isLoading, removeExercicioFromPlano, updateExercicioInPlano } = usePlanoSemanaViewModel();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlanoTreinoItem | null>(null);
  const [form, setForm] = useState<PlanoFormParams>({ dia_da_semana: '', series: '', repeticoes: '', notas: '' });

  const handleOpenMenu = (item: PlanoTreinoItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Editar', 'Remover'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleOpenEditModal(item);
          } else if (buttonIndex === 2) {
            confirmRemove(item.id);
          }
        }
      );
    } else {
      Alert.alert(
        'Opções',
        'O que você gostaria de fazer?',
        [
          { text: 'Editar', onPress: () => handleOpenEditModal(item) },
          { text: 'Remover', onPress: () => confirmRemove(item.id), style: 'destructive' },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  const confirmRemove = (id: number) => {
    Alert.alert(
      'Remover Exercício',
      'Tem certeza que deseja remover este exercício do seu plano?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => removeExercicioFromPlano(id), style: 'destructive' },
      ]
    );
  };

  const handleOpenEditModal = (item: PlanoTreinoItem) => {
    setSelectedItem(item);
    setForm({
      dia_da_semana: item.dia_da_semana.toString(),
      series: item.series.toString(),
      repeticoes: item.repeticoes,
      notas: item.notas || '',
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    await updateExercicioInPlano(selectedItem.id, form);
    setIsEditModalVisible(false);
    setSelectedItem(null);
  };

  const renderItem = ({ item }: { item: PlanoTreinoItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.exercicio.nome}</Text>
        <Text style={styles.itemSubtitle}>{`${item.series}x ${item.repeticoes}`}</Text>
        {item.notas && <Text style={styles.itemNotes}>Notas: {item.notas}</Text>}
      </View>
      <TouchableOpacity onPress={() => handleOpenMenu(item)} style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={24} color="#888" />
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Planejamento da Semana</Text>
        <View style={{ width: 24 }} />
      </View>

      <SectionList
        sections={plano}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Seu plano de treino está vazio.</Text>}
      />

      {selectedItem && (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isEditModalVisible}
            onRequestClose={() => setIsEditModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsEditModalVisible(false)}>
                <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Editar Exercício</Text>
                        <TextInput style={styles.input} placeholder="Dia da Semana (Ex: 1 para Segunda)" placeholderTextColor="#999" keyboardType="numeric" value={form.dia_da_semana} onChangeText={text => setForm(f => ({ ...f, dia_da_semana: text }))} />
                        <TextInput style={styles.input} placeholder="Número de Séries (Ex: 3)" placeholderTextColor="#999" keyboardType="numeric" value={form.series} onChangeText={text => setForm(f => ({ ...f, series: text }))} />
                        <TextInput style={styles.input} placeholder="Repetições (Ex: 8-12)" placeholderTextColor="#999" keyboardType="numeric" value={form.repeticoes} onChangeText={text => setForm(f => ({ ...f, repeticoes: text }))} />
                        <TextInput style={styles.input} placeholder="Notas (Ex: Aumentar peso na próxima)" placeholderTextColor="#999" value={form.notas} onChangeText={text => setForm(f => ({ ...f, notas: text }))} />
                        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      )}
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
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemSubtitle: { fontSize: 14, color: 'gray' },
  itemNotes: { fontSize: 14, color: '#666', fontStyle: 'italic', marginTop: 4 },
  menuButton: { padding: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
  // Modal Styles
  keyboardAvoidingView: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#1e6a43', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PlanoSemanaScreen;