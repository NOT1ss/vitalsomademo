// src/views/TreinoCompletoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import useTreinoCompletoViewModel from '../viewmodels/useTreinoCompletoViewModel';

const ExercicioItem = ({ item, onMarcarRecorde }: { item: any, onMarcarRecorde: (exercicio: any) => void }) => {
  return (
    <View style={styles.exercicioCard}>
      <Image source={item.imagem} style={styles.exercicioImagem} />
      <View style={styles.exercicioInfo}>
        <Text style={styles.exercicioNome}>{item.nome}</Text>
        <Text style={styles.exercicioDetalhe}>{item.observacoes}</Text>
        <TouchableOpacity style={styles.recordeButton} onPress={() => onMarcarRecorde(item)}>
          <Text style={styles.recordeButtonText}>Marcar Recorde</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TreinoCompletoScreen() {
  const { dia, handleGoBack, handleEditar, handleSalvarRecorde } = useTreinoCompletoViewModel();
  const [recordeModalVisible, setRecordeModalVisible] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState<any>(null);
  const [novoPeso, setNovoPeso] = useState('');

  const abrirModalRecorde = (exercicio: any) => {
    setExercicioSelecionado(exercicio);
    setNovoPeso(exercicio.carga.replace('kg', ''));
    setRecordeModalVisible(true);
  };
  
  const salvarNovoRecorde = () => {
      if (exercicioSelecionado && novoPeso) {
        handleSalvarRecorde(exercicioSelecionado, novoPeso);
        setRecordeModalVisible(false);
      } else {
        alert("Por favor, insira um valor para o peso.");
      }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Treino de {dia.diaCompleto}</Text>
        </View>

        <FlatList
          data={dia.exercicios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExercicioItem item={item} onMarcarRecorde={abrirModalRecorde} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
        
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.footerButton} onPress={handleGoBack}>
            <Text style={styles.footerButtonText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, styles.editarButton]} onPress={handleEditar}>
            <Text style={[styles.footerButtonText, { color: '#fff' }]}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Modal
            visible={recordeModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setRecordeModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Marcar Recorde</Text>
                    <Text style={styles.modalExercicioNome}>{exercicioSelecionado?.nome}</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Peso (kg):</Text>
                        <TextInput style={styles.input} value={novoPeso} onChangeText={setNovoPeso} keyboardType="numeric" />
                    </View>
                    <TouchableOpacity style={styles.salvarRecordeButton} onPress={salvarNovoRecorde}>
                        <Text style={styles.salvarRecordeText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative', paddingHorizontal: 20, paddingTop: 20 },
    backButton: { position: 'absolute', left: 20, top: 20, zIndex: 1 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    exercicioCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, marginHorizontal: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3 },
    exercicioImagem: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
    exercicioInfo: { flex: 1 },
    exercicioNome: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    exercicioDetalhe: { fontSize: 14, color: '#555', marginBottom: 10 },
    recordeButton: { backgroundColor: '#E0F2F1', alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
    recordeButtonText: { color: '#00695C', fontWeight: 'bold', fontSize: 12 },
    footerButtons: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderTopColor: '#eee' },
    footerButton: { borderWidth: 1.5, borderColor: '#1e6a43', borderRadius: 20, paddingVertical: 12, width: '45%', alignItems: 'center' },
    footerButtonText: { color: '#1e6a43', fontWeight: 'bold' },
    editarButton: { backgroundColor: '#1e6a43' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '80%', alignItems: 'center', elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    modalExercicioNome: { fontSize: 16, color: '#555', marginBottom: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' },
    inputLabel: { fontSize: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginLeft: 10, flex: 1 },
    salvarRecordeButton: { backgroundColor: '#16A34A', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
    salvarRecordeText: { color: 'white', fontWeight: 'bold' },
});

