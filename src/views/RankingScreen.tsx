// src/views/RankingScreen.tsx
  import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Desafio, DesafioAtivo } from '../models/desafioModel';
import { UsuarioRanking } from '../models/rankingModel';
import { useDesafiosViewModel } from '../viewmodels/useDesafiosViewModel';
import { useRankingViewModel } from '../viewmodels/useRankingViewModel';

  // --- SUB-COMPONENTS DOS DESAFIOS ---

  const DesafioDisponivelCard = ({ desafio, onAccept, isActive, hasActiveChallenge }: { desafio: Desafio, onAccept: () => void, isActive: boolean, hasActiveChallenge: boolean }) => {
    const canAccept = !hasActiveChallenge;
    return (
      <View style={styles.desafioCard}>
        <Ionicons name="bicycle" size={40} color="#005A4A" style={styles.desafioIcon} />
        <View style={styles.desafioInfo}>
          <Text style={styles.desafioTitle}>{desafio.titulo}</Text>
          <Text style={styles.desafioDescription}>{desafio.descricao}</Text>
          <View style={styles.desafioRecompensaContainer}>
            <Text style={styles.desafioPontos}>+{desafio.pontos}</Text>
            <TouchableOpacity
              style={[styles.acceptButton, !canAccept && styles.disabledButton, isActive && styles.activeChallengeButton]}
              onPress={onAccept}
              disabled={!canAccept || isActive}
            >
              <Text style={styles.acceptButtonText}>{isActive ? 'Ativo' : 'Aceitar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const ProgressoDesafio = ({ desafioAtivo, onCancel, onViewOthers }: { desafioAtivo: DesafioAtivo, onCancel: () => void, onViewOthers: () => void }) => {
    const progressoPercentual = desafioAtivo.desafio.meta_km > 0 ? (desafioAtivo.progresso_km / desafioAtivo.desafio.meta_km) * 100 : 0;

    const handleCancel = () => {
      Alert.alert(
        "Cancelar Desafio",
        "Você tem certeza que quer cancelar este desafio? Você perderá 5 pontos.",
        [
          { text: "Não", style: "cancel" },
          { text: "Sim, cancelar", onPress: onCancel, style: "destructive" },
        ]
      );
    };

    return (
      <ScrollView style={styles.progressoContainer}>
        <Text style={styles.desafioTitle}>{desafioAtivo.desafio.titulo}</Text>
        <Text style={styles.desafioDescription}>{desafioAtivo.desafio.descricao}</Text>
        <Text style={styles.desafioPontos}>+{desafioAtivo.desafio.pontos}</Text>

        <View style={styles.progressCircleContainer}>
          <Text style={styles.progressoTitle}>Seu progresso</Text>
          <AnimatedCircularProgress size={200} width={15} fill={progressoPercentual} tintColor="#005A4A" backgroundColor="#e0e0e0" rotation={0} lineCap="round">
            {() => <Ionicons name="bicycle" size={80} color="#005A4A" />}
          </AnimatedCircularProgress>
          <Text style={styles.progressoPercentualText}>{progressoPercentual.toFixed(1)}% concluído</Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onViewOthers}>
            <Text style={styles.secondaryButtonText}>Outros Desafios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // --- COMPONENTE PRINCIPAL ---

  const RankingItem = ({ item, index }: { item: UsuarioRanking; index: number }) => {
    const rank = index + 1;
    const getMedal = () => {
      if (rank === 1) return <Ionicons name="trophy" size={24} color="#FFD700" />;
      if (rank === 2) return <Ionicons name="medal" size={24} color="#C0C0C0" />;
      if (rank === 3) return <Ionicons name="ribbon" size={24} color="#CD7F32" />;
      return <Text style={styles.rankNumber}>{rank}</Text>;
    };
    const getAvatarBorderColor = () => {
      if (rank === 1) return '#FFD700';
      if (rank === 2) return '#007BFF';
      if (rank === 3) return '#D2691E';
      return '#005A4A';
    };
    return (
      <View style={styles.itemContainer}>
        <View style={styles.rankContainer}>{getMedal()}</View>
        <View style={[styles.avatarContainer, { borderColor: getAvatarBorderColor() }]}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle" size={40} color="#333" />
          )}
        </View>
        <Text style={styles.name}>{item.nome}</Text>
        <Text style={styles.score}>{item.pontos}</Text>
      </View>
    );
  };

  export default function RankingScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('Ranking');
    const [showChallengeProgress, setShowChallengeProgress] = useState(true);

    const rankingViewModel = useRankingViewModel();
    const desafiosViewModel = useDesafiosViewModel();

    useEffect(() => {
      if (activeTab === 'Desafios' && desafiosViewModel.desafioAtivo) {
        setShowChallengeProgress(true);
      }
    }, [activeTab, desafiosViewModel.desafioAtivo]);

    const renderContent = () => {
      if (activeTab === 'Ranking') {
        return <FlatList data={rankingViewModel.ranking} renderItem={({ item, index }) => <RankingItem item={item} index={index} />} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer}
  onRefresh={rankingViewModel.fetchRanking} refreshing={rankingViewModel.isLoading} />;
      }

      // Aba Desafios
      if (desafiosViewModel.isLoading) {
        return <ActivityIndicator size="large" color="#005A4A" style={styles.centered} />;
      }

      const shouldShowProgress = desafiosViewModel.desafioAtivo && showChallengeProgress;

      if (shouldShowProgress) {
        return <ProgressoDesafio desafioAtivo={desafiosViewModel.desafioAtivo!} onCancel={desafiosViewModel.cancelarDesafio} onViewOthers={() => setShowChallengeProgress(false)} />;
      }

      return (
        <View style={{flex: 1}}>
          {desafiosViewModel.desafioAtivo && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowChallengeProgress(true)}>
              <Text style={styles.primaryButtonText}>Ver meu progresso</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={desafiosViewModel.desafiosDisponiveis}
            renderItem={({ item }) => <DesafioDisponivelCard desafio={item} onAccept={() => desafiosViewModel.aceitarDesafio(item.id)} isActive={desafiosViewModel.desafioAtivo?.desafio_id === item.id}
  hasActiveChallenge={!!desafiosViewModel.desafioAtivo} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      );
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>
            <Text style={styles.headerTitle}>{activeTab}</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, activeTab === 'Ranking' && styles.activeTab]} onPress={() => setActiveTab('Ranking')}><Text style={[styles.tabText, activeTab === 'Ranking' &&
  styles.activeTabText]}>Ranking</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'Desafios' && styles.activeTab]} onPress={() => setActiveTab('Desafios')}><Text style={[styles.tabText, activeTab === 'Desafios' &&
  styles.activeTabText]}>Desafios</Text></TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 20, paddingBottom: 10 },
    headerButton: { padding: 5 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    tabsContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20, paddingHorizontal: 20 },
    tab: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 10 },
    activeTab: { backgroundColor: '#fff', borderColor: '#005A4A', elevation: 3 },
    tabText: { fontSize: 16, color: '#aaa', fontWeight: 'bold' },
    activeTabText: { color: '#005A4A' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1, shadowRadius: 4 },
    rankContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
    rankNumber: { fontSize: 18, fontWeight: 'bold', color: '#888' },
    avatarContainer: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 },
    avatarImage: { // Novo estilo para a imagem do avatar
      width: '100%',
      height: '100%',
      borderRadius: 25,
    },
    name: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },
    score: { fontSize: 16, fontWeight: 'bold', color: '#005A4A' },
    // Estilos dos Desafios
    desafioCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
  shadowRadius: 4 },
    desafioIcon: { marginRight: 15, alignSelf: 'center' },
    desafioInfo: { flex: 1 },
    desafioTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    desafioDescription: { fontSize: 14, color: '#666', marginVertical: 5 },
    desafioRecompensaContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    desafioPontos: { fontSize: 16, fontWeight: 'bold', color: '#005A4A' },
    acceptButton: { backgroundColor: '#005A4A', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20 },
    acceptButtonText: { color: '#fff', fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#a0a0a0' },
    activeChallengeButton: { backgroundColor: '#3b82f6' },
    progressoContainer: { flex: 1, padding: 20 },
    progressCircleContainer: { alignItems: 'center', marginVertical: 30 },
    progressoTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    progressoPercentualText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 },
    actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 },
    cancelButton: { backgroundColor: '#fee2e2', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 25 },
    cancelButtonText: { fontSize: 16, color: '#ef4444', fontWeight: 'bold' },
    secondaryButton: { backgroundColor: '#f0f0f0', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 25 },
    secondaryButtonText: { fontSize: 16, color: '#333', fontWeight: '500' },
    primaryButton: { backgroundColor: '#005A4A', padding: 15, borderRadius: 15, margin: 20, alignItems: 'center' },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  });