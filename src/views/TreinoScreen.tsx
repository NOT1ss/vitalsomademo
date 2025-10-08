// src/views/TreinoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTreinoViewModel } from '../viewmodels/useTreinoViewModel';

export default function TreinoScreen() {
  const {
    atividades,
    handleSelectAtividade,
    handleSelectOutro,
    handleGoBack,
  } = useTreinoViewModel();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectAtividade(item)}
    >
      <Image source={item.imagem} style={styles.image} />
      <Text style={styles.cardText}>{item.nome}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Atividades físicas</Text>
        </View>

        {/* Grid */}
        <FlatList
          data={atividades}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContainer}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.card, styles.outroCard]}
              onPress={handleSelectOutro}
            >
              <Ionicons name="add" size={40} color="#888" />
              <Text style={styles.cardText}>Outro</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  gridContainer: {
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 100, // Make it circular
    backgroundColor: '#fff',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outroCard: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
  },
});