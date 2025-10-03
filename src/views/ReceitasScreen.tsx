// src/views/ReceitasScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MealCardHorizontal from '../componentes/MealCardHorizontal';
import RecipeCategoryCard from '../componentes/RecipeCategoryCard';
import { Alimento } from '../models/alimentoModel';
import { RootStackParamList } from '../navigation/types';
import { ActiveTab, FoodWithDbId, useReceitasViewModel } from '../viewmodels/useReceitasViewModel';

type ReceitasScreenRouteProp = RouteProp<RootStackParamList, 'Receitas'>;

const AlimentoCardWhite: React.FC<{ food: Alimento; onAdd: () => void }> = ({ food, onAdd }) => (
<View style={styles.alimentoCardWhite}>
  <View style={styles.alimentoInfoWhite}>
    <Text style={styles.alimentoNameWhite}>{food.name}</Text>
    <Text style={styles.alimentoKcalWhite}>{food.kcal} kcal | 100 g</Text>
  </View>
  <TouchableOpacity style={styles.addButtonWhite} onPress={onAdd}>
    <Ionicons name="add" size={24} color="#1e6a43" />
  </TouchableOpacity>
</View>
);

export default function ReceitasScreen() {
const route = useRoute<ReceitasScreenRouteProp>();
const [showPopup, setShowPopup] = useState(false);
const [showMealDetails, setShowMealDetails] = useState<string | null>(null);

const {
  activeTab, handleTabChange, handleGoBack,
  categories, handleCategoryPress,
  displayedFoods, searchText, setSearchText, handleAddFood, handleClearSearch,
  calorieGoal, remainingKcal, totalConsumedKcal, caloriesByMeal, handleMealCardPress, dailyMeals,
  selectedMeal, setSelectedMeal, handleAddFoodToMeal,
  handleRemoveFoodFromMeal, handleClearMeal, isLoading,
} = useReceitasViewModel();

useEffect(() => {
  if (route.params?.selectedMeal) {
    setSelectedMeal(route.params.selectedMeal);
    handleTabChange('alimentos');
    setShowPopup(true);
    const timer = setTimeout(() => setShowPopup(false), 2000);
    return () => clearTimeout(timer);
  }
}, [route.params?.selectedMeal]);

const renderFoodItem = ({ item }: { item: FoodWithDbId }) => (
  <View style={styles.foodItem}>
    <View style={styles.foodInfo}>
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodKcal}>{item.kcal} kcal</Text>
    </View>
    <TouchableOpacity 
      style={styles.removeButton}
      onPress={() => {
        if (showMealDetails) {
          handleRemoveFoodFromMeal(item, showMealDetails);
        }
      }}
    >
      <Ionicons name="close-circle" size={20} color="#e74c3c" />
    </TouchableOpacity>
  </View>
);

const renderCaloriasContent = () => {
  if (isLoading) {
    return (
      <View style={[styles.whiteBackground, styles.centered]}>
        <ActivityIndicator size="large" color="#1e6a43" />
      </View>
    );
  }

  const meals = [
    { name: 'Café da manhã', kcal: caloriesByMeal['Café da manhã'] || 0, items: dailyMeals.find(m => m.name === 'Café da manhã')?.foods.length || 0 },
    { name: 'Almoço', kcal: caloriesByMeal['Almoço'] || 0, items: dailyMeals.find(m => m.name === 'Almoço')?.foods.length || 0 },
    { name: 'Jantar', kcal: caloriesByMeal['Jantar'] || 0, items: dailyMeals.find(m => m.name === 'Jantar')?.foods.length || 0 },
    { name: 'Lanches', kcal: caloriesByMeal['Lanches'] || 0, items: dailyMeals.find(m => m.name === 'Lanches')?.foods.length || 0 },
  ];

  return (
    <View style={styles.whiteBackground}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.calculationSection}>
          <View style={styles.calculationHeader}><Text style={styles.calculationHeaderText}>Cálculo Diário</Text></View>
          <View style={styles.calculationRow}>
            <View style={styles.calculationItem}><Text style={styles.calculationLabel}>Meta</Text><Text style={styles.calculationValue}>{calorieGoal} kcal</Text></View>
            <Text style={styles.calculationOperator}>-</Text>
            <View style={styles.calculationItem}><Text style={styles.calculationLabel}>Consumido</Text><Text style={styles.calculationValue}>{totalConsumedKcal} kcal</Text></View>
            <Text style={styles.calculationOperator}>=</Text>
            <View style={styles.calculationResult}><Text style={styles.calculationValue}>{remainingKcal} kcal</Text><Text style={styles.calculationLabel}>Restantes</Text></View>
          </View>
        </View>
        {meals.map((meal) => (
          <TouchableOpacity key={meal.name} onLongPress={() => meal.items > 0 ? setShowMealDetails(meal.name) : null}>
            <MealCardHorizontal mealName={meal.name} kcal={meal.kcal} items={meal.items} onAdd={() => handleMealCardPress(meal.name)} onClear={meal.items > 0 ? () => Alert.alert('Confirmar', `Deseja remover todos os alimentos de ${meal.name}?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: () => handleClearMeal(meal.name) }]) : undefined} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const renderTab = (tabName: string, tabIdentifier: ActiveTab) => (
  <TouchableOpacity onPress={() => handleTabChange(tabIdentifier)}>
    <Text style={[styles.tabText, activeTab === tabIdentifier && styles.activeTabText]}>
      {tabName}
    </Text>
    {activeTab === tabIdentifier && <View style={styles.activeTabLine} />}
  </TouchableOpacity>
);
const renderAlimentosContent = () => (
  <View style={styles.whiteBackground}>
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar"
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />
      {searchText.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
          <Ionicons name="close-circle" size={24} color="#999" />
        </TouchableOpacity>
      )}
    </View>

    <FlatList
      data={displayedFoods}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AlimentoCardWhite
          food={item}
          onAdd={() =>
            selectedMeal
              ? handleAddFoodToMeal(item, selectedMeal)
              : handleAddFood(item)
          }
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum alimento encontrado</Text>
        </View>
      }
    />
  </View>
);

const renderReceitasContent = () => (
  <View style={styles.receitasContainer}>
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RecipeCategoryCard category={item} onPress={handleCategoryPress} />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 80 }}
    />

    <View style={styles.favoritesButtonContainer}>
      <TouchableOpacity
        style={styles.favoritesButton}
        onPress={() => console.log('Favoritos pressionado')}
      >
        <Ionicons
          name="heart"
          size={20}
          color="#4CAF50"
          style={styles.favoritesHeart}
        />
        <Text style={styles.favoritesText}>Favoritas</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const getHeaderTitle = () => { switch (activeTab) { case 'receitas': return 'Receitas'; case 'alimentos': return selectedMeal ? `Adicionar em ${selectedMeal}` : 'Alimentos'; case 'calorias': return 'Calorias'; default: return 'Receitas'; } };

return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
      </View>

      <View style={styles.tabsContainer}>
        {renderTab('Receitas', 'receitas')}
        {renderTab('Alimentos', 'alimentos')}
        {renderTab('Calorias', 'calorias')}
      </View>

      {activeTab === 'receitas' && renderReceitasContent()}
      {activeTab === 'alimentos' && renderAlimentosContent()}
      {activeTab === 'calorias' && renderCaloriasContent()}

      <Modal animationType="fade" transparent={true} visible={showPopup} onRequestClose={() => setShowPopup(false)}>
        <View style={styles.popupOverlay}><View style={styles.popupContainer}><Text style={styles.popupText}>Selecione os alimentos</Text>{selectedMeal && (<Text style={styles.popupSubText}>para {selectedMeal}</Text>)}</View></View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={showMealDetails !== null} onRequestClose={() => setShowMealDetails(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{showMealDetails} - Alimentos Adicionados</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowMealDetails(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={dailyMeals.find(m => m.name === showMealDetails)?.foods || []}
              keyExtractor={(item) => `${item.db_id}`}
              renderItem={renderFoodItem}
              ListEmptyComponent={<Text style={styles.emptyModalText}>Nenhum alimento adicionado</Text>}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
// Seus estilos aqui, não precisam de alteração
safeArea: { flex: 1, backgroundColor: '#1e6a43' },
container: { flex: 1 },
centered: { justifyContent: 'center', alignItems: 'center' },
headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, position: 'relative', paddingHorizontal: 20, },
backButton: { position: 'absolute', left: 20, padding: 5 },
headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 0, paddingHorizontal: 20, },
tabText: { color: '#a0d1c3', fontSize: 16, paddingBottom: 10 },
activeTabText: { color: '#fff', fontWeight: 'bold' },
activeTabLine: { height: 3, backgroundColor: '#fff', borderRadius: 2 },
receitasContainer: { flex: 1, paddingHorizontal: 20 },
whiteBackground: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
searchContainer: { backgroundColor: '#f0f0f0', borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginVertical: 10, },
searchIcon: { marginRight: 10 },
clearButton: { padding: 5 },
searchInput: { flex: 1, height: 50, color: '#333', fontSize: 16 },
alimentoCardWhite: { backgroundColor: '#f8f8f8', borderRadius: 10, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, },
alimentoInfoWhite: { flex: 1 },
alimentoNameWhite: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
alimentoKcalWhite: { fontSize: 14, color: '#666' },
addButtonWhite: { backgroundColor: '#e8f5e8', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', },
emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
emptyText: { color: '#333', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
emptySubText: { color: '#666', textAlign: 'center', fontSize: 16, marginTop: 5 },
favoritesButtonContainer: { position: 'absolute', bottom: 20, left: 20, right: 20, alignItems: 'flex-end' },
favoritesButton: { backgroundColor: '#1e6a43', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, },
favoritesHeart: { marginRight: 8 },
favoritesText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
scrollContent: { paddingBottom: 20 },
calculationSection: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 15, marginBottom: 15, marginTop: 10, },
calculationHeader: { backgroundColor: '#a0d1c3', borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start', marginBottom: 15, },
calculationHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
calculationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', },
calculationItem: { alignItems: 'center' },
calculationResult: { alignItems: 'center' },
calculationLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
calculationValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
calculationOperator: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 5 },
popupOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
popupContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', minWidth: 200 },
popupText: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
popupSubText: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', },
modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingTop: 20, },
modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', },
modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
closeButton: { padding: 5 },
modalList: { padding: 20 },
foodItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f8f8', padding: 15, borderRadius: 8, marginBottom: 10, },
foodInfo: { flex: 1 },
foodName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
foodKcal: { fontSize: 14, color: '#666' },
removeButton: { padding: 5 },
emptyModalText: { textAlign: 'center', color: '#666', fontSize: 16, marginTop: 20, },
});