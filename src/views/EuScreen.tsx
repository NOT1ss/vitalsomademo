// src/views/EuScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptimizedImage from '../componentes/OptimizedImage';
import { usePerfilViewModel } from '../viewmodels/usePerfilViewModel';

// --- COMPONENTES LOCAIS ---

const InfoBox = ({ label, value, category }: { label: string; value: string | number | undefined, category?: 'bom' | 'regular' | 'ruim' | null }) => {
  const categoryStyle = category === 'bom' ? styles.infoBoxGood :
                      category === 'regular' ? styles.infoBoxRegular :
                      category === 'ruim' ? styles.infoBoxBad :
                      {};

  return (
    <View style={[styles.infoBox, categoryStyle]}>
      <Text style={[styles.infoBoxLabel, (category) && styles.infoBoxLabelColored]}>{label}</Text>
      <Text style={[styles.infoBoxValue, (category) && styles.infoBoxValueColored]}>{value || '--'}</Text>
    </View>
  );
};

const CollapsibleCard = ({ title, children, iconName }: { title: string, children: React.ReactNode, iconName: keyof typeof Ionicons.glyphMap }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.collapsibleContainer}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setIsOpen(!isOpen)} activeOpacity={0.8}>
        <View style={styles.collapsibleTitleContainer}>
          <Ionicons name={iconName} size={20} color="#00695C" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={24} color="#333" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.collapsibleContent}>
          {children}
        </View>
      )}
    </View>
  );
}

// --- TELA PRINCIPAL ---

const EuScreen: React.FC = () => {
  const { 
    userData, 
    loading, 
    handleLogout,
    calorieGoalInput,
    setCalorieGoalInput,
    alturaInput,
    setAlturaInput,
    pesoInput,
    setPesoInput,
    pesoMetaInput,
    setPesoMetaInput,
    isSaving,
    handleSaveChanges,
    calculatedImc,
    imcCategory,
    trainingStreak,
    top3Records,
    handleDeleteRecord,
    // Para o modal de edição
    isEditModalVisible,
    setEditModalVisible,
    nomeInput,
    setNomeInput,
    newAvatarUri,
    handleOpenEditModal,
    handlePickImage,
    handleProfileUpdate,
  } = usePerfilViewModel();

  if (loading && !isEditModalVisible) { // Não mostra loading de tela cheia se o modal estiver aberto
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  const renderEditModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isEditModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.editModalContainer}>
                <Text style={styles.modalTitle}>Editar Perfil</Text>
                
                <TouchableOpacity onPress={handlePickImage} style={styles.avatarPicker}>
                  <OptimizedImage 
                    source={newAvatarUri ? { uri: newAvatarUri } : require('../../assets/images/eu.png')} 
                    style={styles.modalAvatar}
                  />
                  <View style={styles.avatarEditIcon}>
                    <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={nomeInput}
                  onChangeText={setNomeInput}
                  placeholder="Seu nome"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity 
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                  onPress={handleProfileUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {typeof isEditModalVisible === 'boolean' && renderEditModal()}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleOpenEditModal} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#333" />
          </TouchableOpacity>
          <OptimizedImage
            source={userData?.avatar_url ? { uri: userData.avatar_url } : require('../../assets/images/eu.png')}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userData?.nome || 'Bem-vindo!'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <InfoBox label="Altura" value={`${userData?.altura || '--'} m`} />
          <InfoBox label="Peso" value={`${userData?.peso || '--'} kg`} />
          <InfoBox label="IMC" value={calculatedImc?.toFixed(2) || '--'} category={imcCategory} />
        </View>

        <CollapsibleCard title="Minhas Metas e Dados" iconName="options-outline">
          <Text style={styles.inputLabel}>Altura (m)</Text>
          <TextInput
            style={styles.input}
            value={alturaInput}
            onChangeText={setAlturaInput}
            keyboardType="numeric"
            placeholder="Ex: 1.75"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={pesoInput}
            onChangeText={setPesoInput}
            keyboardType="numeric"
            placeholder="Ex: 70.5"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Meta de Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={pesoMetaInput}
            onChangeText={setPesoMetaInput}
            keyboardType="numeric"
            placeholder="Ex: 65"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Meta Diária de Calorias (kcal)</Text>
          <TextInput
            style={styles.input}
            value={calorieGoalInput}
            onChangeText={setCalorieGoalInput}
            keyboardType="numeric"
            placeholder="Ex: 2000"
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Salvar Metas</Text>
            )}
          </TouchableOpacity>
        </CollapsibleCard>

        <CollapsibleCard title="Conquistas" iconName="trophy-outline">
          <View style={styles.achievementItem}>
            <Ionicons name="flame-outline" size={24} color="#f97316" />
            <Text style={styles.achievementText}>Ofensiva de treinos: <Text style={{fontWeight: 'bold'}}>{trainingStreak} dias</Text></Text>
          </View>
          <View style={styles.achievementItem}>
            <Ionicons name="barbell-outline" size={24} color="#3b82f6" />
            <Text style={styles.achievementText}>Recordes Pessoais:</Text>
          </View>
          {top3Records.map(([exercicio, valor]) => (
            <View key={exercicio} style={styles.recordItem}>
              <View style={{flex: 1}}>
                <Text style={styles.recordExercicio}>{exercicio}</Text>
                <Text style={styles.recordValor}>{valor}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteRecord(exercicio)} style={styles.deleteRecordButton}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </CollapsibleCard>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="white" />
          <Text style={styles.buttonText}>Deslogar</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, backgroundColor: '#e0e0e0' },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userEmail: { fontSize: 16, color: 'gray' },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom: 10, // Espaço antes dos cards
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  infoBoxLabel: { fontSize: 14, color: 'gray' },
  infoBoxValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  infoBoxGood: { backgroundColor: '#dcfce7' },
  infoBoxRegular: { backgroundColor: '#fef3c7' },
  infoBoxBad: { backgroundColor: '#fee2e2' },
  infoBoxLabelColored: { color: '#555' },
  infoBoxValueColored: { color: '#000' },
  collapsibleContainer: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginTop: 20,
    overflow: 'hidden', // Garante que o conteúdo não vaze
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  collapsibleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  collapsibleContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputLabel: { fontSize: 14, color: 'gray', marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#00695C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: { backgroundColor: '#A5A5A5' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  logoutButton: {
    marginTop: 30,
    marginBottom: 40,
    marginHorizontal: 20,
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Estilos para Conquistas
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  achievementText: {
    fontSize: 16,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 34, // Alinha com o texto acima
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordExercicio: { fontSize: 14, color: '#333' },
  recordValor: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  deleteRecordButton: {
    padding: 5,
  },
  // Estilos do Modal de Edição
  keyboardAvoidingView: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  editModalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  avatarPicker: { marginBottom: 20, position: 'relative' },
  modalAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0' },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00695C',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default EuScreen;