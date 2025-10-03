// src/views/SemanaTreinoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { useSemanaTreinoViewModel } from '../viewmodels/useSemanaTreinoViewModel';

const windowWidth = Dimensions.get('window').width;
const circleSize = (windowWidth - 40) / 7 - 8;

type SemanaTreinoNavigationProp = StackNavigationProp<RootStackParamList, 'SemanaTreino'>;
type SemanaTreinoRouteProp = RouteProp<RootStackParamList, 'SemanaTreino'>;

const DiaItem = ({ dia, isSelected, onPress }: { dia: any, isSelected: boolean, onPress: () => void }) => (
  <TouchableOpacity style={styles.diaContainer} onPress={onPress}>
    <Text style={[styles.diaTextoAbreviado, isSelected && styles.diaSelecionadoTexto]}>{dia.diaAbreviado}</Text>
    <View style={[styles.circuloDia, isSelected && styles.circuloDiaSelecionado, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
      {dia.status === 'concluido' && <Ionicons name="checkmark-sharp" size={circleSize * 0.6} color="#16A34A" />}
      {dia.status === 'nao_realizado' && <Ionicons name="close-sharp" size={circleSize * 0.6} color="#DC2626" />}
      {dia.status === 'pendente' && <Text style={[styles.diaNumero, isSelected && styles.diaSelecionadoTexto, { fontSize: circleSize * 0.4 }]}>{dia.numero}</Text>}
    </View>
  </TouchableOpacity>
);

export default function SemanaTreinoScreen() {
  const navigation = useNavigation<SemanaTreinoNavigationProp>();
  const route = useRoute<SemanaTreinoRouteProp>();

  const {
    dias,
    diaSelecionado,
    isLoading,
    atualizarDia,
    handleMarcarConcluido,
    handleSelecionarDia,
    handleGoBack,
    handleVerTreino,
    handleTreinar,
    handleVerMaisCalendario,
  } = useSemanaTreinoViewModel();

  const [recordeInfo, setRecordeInfo] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.novoRecorde) {
      setRecordeInfo(route.params.novoRecorde);
      navigation.setParams({ novoRecorde: undefined });
      const timer = setTimeout(() => setRecordeInfo(null), 5000);
      return () => clearTimeout(timer);
    }
    if (route.params?.diaAtualizado) {
      atualizarDia(route.params.diaAtualizado);
      navigation.setParams({ diaAtualizado: undefined });
    }
  }, [route.params]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}><View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1e6a43" /></View></SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Semana</Text>
        <View style={styles.seletorSemana}>
          {dias?.map((dia) => (
            <DiaItem key={dia.id} dia={dia} isSelected={dia.id === diaSelecionado?.id} onPress={() => handleSelecionarDia(dia)} />
          ))}
        </View>
        <TouchableOpacity onPress={handleVerMaisCalendario}><Text style={styles.verMais}>Ver mais</Text></TouchableOpacity>
        <Text style={styles.diaCompletoTitulo}>{diaSelecionado?.diaCompleto}</Text>
        {diaSelecionado && diaSelecionado.exercicios.length > 0 ? (
          <FlatList horizontal data={diaSelecionado.exercicios} keyExtractor={(item) => item.id} renderItem={({ item }) => (
              <View style={styles.exercicioCard}><Text style={styles.exercicioNome}>{item.nome}</Text><Image source={item.imagem} style={styles.exercicioImagem} resizeMode="contain" /></View>
            )} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }} />
        ) : (
          <View style={styles.semTreinoContainer}><Text style={styles.semTreinoTexto}>Nenhum treino para este dia.</Text></View>
        )}
        <View style={styles.botoesAcaoContainer}>
          <TouchableOpacity style={styles.botaoAcao} onPress={handleTreinar}><Text style={styles.botaoAcaoTexto}>Treinar</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.botaoAcao, styles.botaoConcluido]} onPress={handleMarcarConcluido}><Text style={[styles.botaoAcaoTexto, { color: '#fff' }]}>Concluído</Text></TouchableOpacity>
          <TouchableOpacity style={styles.botaoAcao} onPress={handleVerTreino}><Text style={styles.botaoAcaoTexto}>Ver treino</Text></TouchableOpacity>
        </View>
        {recordeInfo && (<View style={styles.gamificacaoCard}><Ionicons name="trophy" size={24} color="#FBBF24" /><View style={styles.gamificacaoTextoContainer}><Text style={styles.gamificacaoTitulo}>Parabéns</Text><Text style={styles.gamificacaoSubtitulo}>Você bateu um recorde!</Text></View><Text style={styles.gamificacaoDestaque}>{recordeInfo}</Text></View>)}
        <View style={styles.gamificacaoCard}><Ionicons name="flame" size={24} color="#EF4444" /><View style={styles.gamificacaoTextoContainer}><Text style={styles.gamificacaoTitulo}>Ofensiva</Text><Text style={styles.gamificacaoSubtitulo}>Você está em uma sequência de dias treinados.</Text></View><Text style={styles.gamificacaoDestaque}>3 Dias</Text></View>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 20, alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    seletorSemana: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 5 },
    diaContainer: { alignItems: 'center', flex: 1 },
    diaTextoAbreviado: { color: '#888', marginBottom: 5, fontWeight: '500' },
    circuloDia: { borderWidth: 1.5, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    circuloDiaSelecionado: { borderColor: '#16A34A', borderWidth: 2 },
    diaNumero: { fontWeight: 'bold', color: '#555' },
    diaSelecionadoTexto: { color: '#16A34A', fontWeight: 'bold' },
    verMais: { alignSelf: 'flex-end', color: '#555', fontSize: 12, marginBottom: 20, textDecorationLine: 'underline' },
    diaCompletoTitulo: { fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 0 },
    exercicioCard: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginRight: 15, alignItems: 'center', width: 140, height: 180, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: {width: 0, height: 2} },
    exercicioNome: { fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    exercicioImagem: { width: 100, height: 100 },
    botoesAcaoContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
    botaoAcao: { borderWidth: 1.5, borderColor: '#16A34A', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
    botaoAcaoTexto: { color: '#16A34A', fontWeight: 'bold' },
    botaoConcluido: { backgroundColor: '#16A34A' },
    gamificacaoCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, alignItems: 'center', width: '100%', marginBottom: 15, elevation: 2 },
    gamificacaoTextoContainer: { flex: 1, marginLeft: 10 },
    gamificacaoTitulo: { fontWeight: 'bold' },
    gamificacaoSubtitulo: { fontSize: 12, color: '#666' },
    gamificacaoDestaque: { fontWeight: 'bold', color: '#16A34A' },
    backButton: { marginTop: 20, alignSelf: 'flex-start' },
    semTreinoContainer: { height: 180, justifyContent: 'center', alignItems: 'center', width: '100%' },
    semTreinoTexto: { fontSize: 16, color: '#888' },
});