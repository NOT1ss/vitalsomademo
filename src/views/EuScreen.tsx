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
  container: { flex: 1, backgroundColor: '#f8f9f8' },

  // ===== HEADER =====
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#f1f1f1',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1b5e20' },
  userEmail: { fontSize: 15, color: '#777' },
  // ===== INFO BOXES =====
  // ===== INFO BOXES =====
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  infoBoxLabel: { fontSize: 14, color: '#777' },
  infoBoxValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#333' },
  infoBoxGood: { backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' },
  infoBoxRegular: { backgroundColor: '#fffde7', borderColor: '#fff59d' },
  infoBoxBad: { backgroundColor: '#ffebee', borderColor: '#ef9a9a' },
  infoBoxLabelColored: { color: '#555' },
  infoBoxValueColored: { color: '#111' },

  // ===== COLLAPSIBLE CARDS =====
  collapsibleContainer: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  collapsibleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  collapsibleContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },

  // ===== INPUTS & BUTTONS =====
  inputLabel: { fontSize: 14, color: '#555', marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonDisabled: { backgroundColor: '#a5a5a5' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  logoutButton: {
    marginTop: 35,
    marginBottom: 50,
    marginHorizontal: 20,
    backgroundColor: '#5e5e5eff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // ===== CONQUISTAS =====
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  achievementText: { fontSize: 16, color: '#333' },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordExercicio: { fontSize: 14, color: '#333' },
  recordValor: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  deleteRecordButton: { padding: 5 },

  // ===== MODAL DE EDIÇÃO =====
  keyboardAvoidingView: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginBottom: 20 },
  avatarPicker: { marginBottom: 20, position: 'relative' },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#a5d6a7',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2e7d32',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
});


export default EuScreen;