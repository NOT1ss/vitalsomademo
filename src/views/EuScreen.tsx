// src/screens/EuScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptimizedImage from '../componentes/OptimizedImage';
import { usePerfilViewModel } from '../viewmodels/usePerfilViewModel';

// --- COMPONENTES LOCAIS ---

type InfoBoxProps = {
  label: string;
  value: string | number | undefined;
  category?: 'bom' | 'regular' | 'ruim' | null;
};

const InfoBox: React.FC<InfoBoxProps> = ({ label, value, category }) => {
  const categoryStyle =
    category === 'bom'
      ? styles.infoBoxGood
      : category === 'regular'
      ? styles.infoBoxRegular
      : category === 'ruim'
      ? styles.infoBoxBad
      : {};

  return (
    <View style={[styles.infoBox, categoryStyle]}>
      <Text style={[styles.infoBoxLabel, category && styles.infoBoxLabelColored]}>{label}</Text>
      <Text style={[styles.infoBoxValue, category && styles.infoBoxValueColored]}>
        {value ?? '--'}
      </Text>
    </View>
  );
};

const CollapsibleCard: React.FC<{
  title: string;
  children: React.ReactNode;
  iconName: keyof typeof Ionicons.glyphMap;
}> = ({ title, children, iconName }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.collapsibleContainer}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={styles.collapsibleTitleContainer}>
          <Ionicons name={iconName} size={20} color="#005A4A" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
      </TouchableOpacity>
      {isOpen && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

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
    // Modal & profile
    isEditModalVisible,
    setEditModalVisible,
    nomeInput,
    setNomeInput,
    newAvatarUri,
    handleOpenEditModal,
    handlePickImage,
    handleProfileUpdate,
  } = usePerfilViewModel();

  console.log('[EuScreen] trainingStreak:', trainingStreak);

  // --- Animação das frases motivacionais ---
  const phrases: string[][] = [
    ['Treine.', 'Evolua.', 'Viva melhor. 🔥'],
    ['Mova-se.', 'Supere-se.', 'Inspire-se. 💪'],
    ['Mais energia.', 'Mais foco,', 'Mais você. 🏆'],
  ];
  const [motivationIndex, setMotivationIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = () => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setMotivationIndex((i) => (i + 1) % phrases.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    };

    const id = setInterval(cycle, 9000);
    return () => clearInterval(id);
  }, [fadeAnim]);

  // Mensagem de salvo
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const handleSaveProfile = async () => {
    await handleProfileUpdate();
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2500);
  };

  // Loading global (se houver) - não mostrar tela cheia se modal de edição estiver aberto
  if (loading && !isEditModalVisible) {
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
      visible={!!isEditModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.editModalContainer}>
                <Text style={styles.modalTitle}>Editar Perfil</Text>

                <TouchableOpacity onPress={handlePickImage} style={styles.avatarPicker} activeOpacity={0.8}>
                  <OptimizedImage
                    source={newAvatarUri ? { uri: newAvatarUri } : require('../../assets/images/eu.png')}
                    style={styles.modalAvatar}
                  />
                  <View style={styles.avatarEditIcon} pointerEvents="none">
                    <Ionicons name="camera-outline" size={20} color="#fff" />
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
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
                </TouchableOpacity>

                {showSavedMessage && <Text style={styles.savedMessage}>✅ Perfil atualizado!</Text>}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9f8" />
      {renderEditModal()}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleOpenEditModal} style={styles.editButton} hitSlop={{ top: 18, left: 18, right: 18, bottom: 18 }} activeOpacity={0.8}>
            <Ionicons name="settings-outline" size={26} color="#6b6b6b" />
          </TouchableOpacity>

          <View style={styles.headerContent} pointerEvents="box-none">
            <View style={styles.avatarWrapper}>
              <OptimizedImage
                source={userData?.avatar_url ? { uri: userData.avatar_url } : require('../../assets/images/eu.png')}
                style={styles.profileImage}
              />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
              <Text style={styles.userName}>{userData?.nome || 'Seu nome'}</Text>
              <Text style={styles.userEmail}>{userData?.email || 'email@exemplo.com'}</Text>
            </View>
          </View>
        </View>

        <Animated.View style={[{ opacity: fadeAnim }, styles.phrasesContainer]}>
          {phrases[motivationIndex].map((line, idx) => (
            <Text key={idx} style={idx < 2 ? styles.phraseGray : styles.phraseGreenLarge}>
              {line}
            </Text>
          ))}
        </Animated.View>

        <View style={styles.topStatsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="scale-outline" size={26} color="#fff" />
            </View>
            <Text style={styles.statValue}>{userData?.peso ? `${userData.peso} KG` : '--'}</Text>
            <Text style={styles.statLabel}>Peso</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="person-outline" size={26} color="#fff" />
            </View>
            <Text style={styles.statValue}>{userData?.altura ? `${userData.altura} cm` : '--'}</Text>
            <Text style={styles.statLabel}>Altura</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="bar-chart" size={26} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
            </View>
            <Text style={styles.statValue}>{calculatedImc ? calculatedImc.toFixed(2) : '--'}</Text>
            <Text style={styles.statLabel}>IMC</Text>
          </View>
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
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar Metas</Text>}
          </TouchableOpacity>
        </CollapsibleCard>

        <CollapsibleCard title="Conquistas" iconName="trophy-outline">
          <View style={styles.achievementItem}>
            <Ionicons name="flame-outline" size={24} color="#f97316" />
            <Text style={styles.achievementText}>
              Ofensiva de treinos: <Text style={{ fontWeight: 'bold' }}>{trainingStreak} dias</Text>
            </Text>
          </View>

          <View style={styles.achievementItem}>
            <Ionicons name="barbell-outline" size={24} color="#3b82f6" />
            <Text style={styles.achievementText}>Recordes Pessoais:</Text>
          </View>

          {top3Records?.map(([exercicio, valor]) => (
            <View key={exercicio} style={styles.recordItem}>
              <View style={{ flex: 1 }}>
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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },

  header: {
    alignItems: 'flex-start',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  avatarWrapper: {
    borderWidth: 5,
    borderColor: '#005A4A',
    borderRadius: 70,
    padding: 3,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    zIndex: 20,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 0,
    backgroundColor: '#f8f8f8',
  },
  headerText: { flex: 1 },
  welcomeText: { fontSize: 16, color: '#666', marginBottom: 6 },
  userName: { fontSize: 24, fontWeight: '700', color: '#1b5e20' },
  userEmail: { fontSize: 16, color: '#777', marginTop: 2 },

  phrasesContainer: { marginTop: 14, paddingHorizontal: 20, alignSelf: 'flex-start' },
  phraseGray: { fontSize: 28, color: '#777', fontWeight: '600', textAlign: 'left', lineHeight: 34 },
  phraseGreenLarge: { fontSize: 32, color: '#005A4A', fontWeight: '800', textAlign: 'left', lineHeight: 38 },

  topStatsCard: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: '#323233',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  statIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#484848',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 18, color: '#005A4A', fontWeight: '700' },
  statLabel: { fontSize: 14, color: '#e6eef0', marginTop: 8 },

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
    elevation: 2,
  },
  infoBoxLabel: { fontSize: 14, color: '#777' },
  infoBoxLabelColored: { color: '#005A4A', fontWeight: '600' },
  infoBoxValue: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#333' },
  infoBoxValueColored: { color: '#005A4A' },
  infoBoxGood: { backgroundColor: '#005A4A' },
  infoBoxRegular: { backgroundColor: '#fffde7' },
  infoBoxBad: { backgroundColor: '#ffebee' },

  collapsibleContainer: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#005A4A' },
  collapsibleContent: { paddingHorizontal: 20, paddingBottom: 20 },

  inputLabel: { fontSize: 14, color: '#5c5959ff', marginBottom: 5, marginTop: 10 },
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
    backgroundColor: '#005A4A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  achievementItem: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 10, gap: 10 },
  achievementText: { fontSize: 16, color: '#6d6d6dff' },
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
  recordValor: { fontSize: 14, fontWeight: 'bold', color: '#005A4A' },
  deleteRecordButton: { padding: 5 },

  // MODAL
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
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#005A4A', marginBottom: 20 },
  avatarPicker: { marginBottom: 20, position: 'relative' },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#005A4A',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#005A4A',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  savedMessage: {
    marginTop: 10,
    fontSize: 14,
    color: '#005A4A',
    fontWeight: '600',
  },
});

export default EuScreen;
