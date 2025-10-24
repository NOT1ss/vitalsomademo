import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AlimentoCard from '../componentes/AlimentoCard';
import { useAlimentosViewModel } from '../viewmodels/useAlimentosViewModel';

export default function AlimentosScreen() {
  const {
    displayedFoods,
    searchText,
    setSearchText,
    handleAddFood,
    handleGoBack,
    handleFavoritesPress,
    loading,
    error,
  } = useAlimentosViewModel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Alimentos</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#a0d1c3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise seu alimento"
            placeholderTextColor="#a0d1c3"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
        ) : error ? (
          <Text style={styles.emptyText}>{error}</Text>
        ) : (
          <FlatList
            data={displayedFoods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlimentoCard food={item} onAdd={handleAddFood} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum alimento encontrado.</Text>
            }
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.footerButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFavoritesPress} style={styles.footerButton}>
            <Text style={styles.footerText}>Favoritas</Text>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e6a43',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});