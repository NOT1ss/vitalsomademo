
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useReceitasSupabaseViewModel, Receita } from '../viewmodels/useReceitasSupabaseViewModel';

// Reutilizando o RecipeCard da ReceitasListScreen (idealmente, seria um componente separado)
const RecipeCard = ({ item, onPress, isFavorite, onToggleFavorite }: { item: Receita; onPress: () => void; isFavorite: boolean; onToggleFavorite: () => void; }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: item.imagem_url }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.titulo}</Text>
    </View>
    <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
      <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#1e6a43' : '#888'} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const ReceitasFavoritasScreen = () => {
  const navigation = useNavigation();
  const { receitas, isLoading, favoriteIds, fetchFavoriteRecipes, toggleFavorite } = useReceitasSupabaseViewModel();

  useFocusEffect(
    useCallback(() => {
      fetchFavoriteRecipes();
    }, [fetchFavoriteRecipes])
  );

  const handleRecipePress = (receitaId: number) => {
    // @ts-ignore
    navigation.navigate('ReceitaDetail', { receitaId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
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
        <Text style={styles.headerTitle}>Receitas Favoritas</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={receitas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard 
            item={item} 
            onPress={() => handleRecipePress(item.id)} 
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não favoritou nenhuma receita.</Text>}
      />
    </SafeAreaView>
  );
};

// Estilos (similares a ReceitasListScreen)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeAreaLoading: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e6a43',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteButton: {
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default ReceitasFavoritasScreen;
