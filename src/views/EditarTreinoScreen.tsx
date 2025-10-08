// src/views/EditarTreinoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// CORREÇÃO: Corrigindo o nome do arquivo no import
import useEditarTreinoViewModel from '../viewmodels/useEditorTreinoViewModel';

export default function EditarTreinoScreen() {
    const navigation = useNavigation();
    const { dia, exercicios, handleAdicionarExercicio, handleRemoverExercicio } = useEditarTreinoViewModel();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Editar Treino de {dia.diaCompleto}</Text>
                </View>

                <FlatList
                    data={exercicios}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <View style={styles.exercicioCard}>
                             <Image source={item.imagem} style={styles.exercicioImagem} />
                             <View style={styles.exercicioInfo}>
                                <Text style={styles.exercicioNome}>{item.nome}</Text>
                                <Text style={styles.exercicioDesc}>{item.series} séries de {item.repeticoes} reps com {item.carga}</Text>
                             </View>
                             <TouchableOpacity style={styles.removerButton} onPress={() => handleRemoverExercicio(item.db_id, item.id)}>
                                 <Ionicons name="trash-outline" size={20} color="#DC2626" />
                             </TouchableOpacity>
                        </View>
                    )}
                    ListFooterComponent={
                        // CORREÇÃO: O onPress agora chama a função com o nome correto
                        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarExercicio}>
                            <Ionicons name="add" size={24} color="#1e6a43" />
                            <Text style={styles.addButtonText}>Adicionar Exercício</Text>
                        </TouchableOpacity>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                <View style={styles.footerButtons}>
                    <TouchableOpacity style={styles.footerButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.footerButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
    container: { flex: 1, paddingTop: 20 },
    header: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    exercicioCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginHorizontal: 20, marginBottom: 15, alignItems: 'center', elevation: 2 },
    exercicioImagem: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
    exercicioInfo: { flex: 1 },
    exercicioNome: { fontWeight: 'bold' },
    exercicioDesc: { fontSize: 12, color: '#666' },
    removerButton: { padding: 8 },
    addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#1e6a43', borderStyle: 'dashed', borderRadius: 12, padding: 15, marginHorizontal: 20, marginTop: 10 },
    addButtonText: { marginLeft: 10, color: '#1e6a43', fontWeight: 'bold' },
    footerButtons: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e5e5', backgroundColor: '#f0f0f0' },
    footerButton: { borderWidth: 1.5, borderColor: '#1e6a43', borderRadius: 20, paddingVertical: 12, width: '48%', alignItems: 'center' },
    footerButtonText: { color: '#1e6a43', fontWeight: 'bold' },
    salvarButton: { backgroundColor: '#1e6a43' },
});