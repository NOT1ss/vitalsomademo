// src/views/DiaryScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import OptimizedImage from '../componentes/OptimizedImage';
import useDiaryViewModel, { FoodWithDbId, Meal } from '../viewmodels/DiaryViewModel';

const FoodItem = ({ item }: { item: FoodWithDbId }) => (
  <View style={styles.foodItem}>
    <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.foodKcal}>{item.kcal} kcal</Text>
  </View>
);

const DiaryScreen = () => {
  const {
    dailyMeals,
    isLoading,
    healthTips,
    currentTipIndex,
    selectedMeal,
    isModalVisible,
    handleOpenMealModal,
    handleCloseMealModal,
    handleClearMeal,
    handleNavigateToAddFood,
    handleNavigateToTreino,
    handleOpenWorkoutList,
    handleOpenWeekPlanning,
    changeHealthTip,
    navigation,
  } = useDiaryViewModel();

  const renderMealModal = () => {
    if (!selectedMeal) return null;

    const totalKcal = selectedMeal.foods.reduce((sum, food) => sum + food.kcal, 0);

    const onClear = () => {
      Alert.alert(
        'Limpar Refeição',
        `Tem certeza que deseja remover todos os alimentos de "${selectedMeal.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => handleClearMeal(selectedMeal.name), style: 'destructive' },
        ]
      );
    };

    return (
      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={handleCloseMealModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={handleCloseMealModal}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                <TouchableOpacity onPress={handleCloseMealModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTotalKcal}>Total: {totalKcal} kcal</Text>

              <ScrollView style={styles.foodListContainer}>
                {selectedMeal.foods.length > 0 ? (
                  selectedMeal.foods.map(food => <FoodItem key={food.db_id} item={food} />)
                ) : (
                  <Text style={styles.emptyFoodText}>Nenhum alimento adicionado.</Text>
                )}
              </ScrollView>

              <View style={styles.modalActionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleNavigateToAddFood(selectedMeal.name)}>
                  <Ionicons name="add" size={20} color="#1b5e20" />
                  <Text style={styles.actionButtonText}>Adicionar</Text>
                </TouchableOpacity>
                {selectedMeal.foods.length > 0 && (
                  <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={onClear}>
                    <Ionicons name="trash-outline" size={20} color="#c0392b" />
                    <Text style={[styles.actionButtonText, { color: '#c0392b' }]}>Limpar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderMealModal()}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Título “Agenda” alinhado à esquerda */}
        <Text style={styles.sectionAgenda}>Agenda</Text>

        {/* Blocos de Alimentação e Treino */}
        <View style={styles.topCardContainer}>
          <TouchableOpacity style={styles.topCard} onPress={() => navigation.navigate('Receitas')}>
            <Ionicons name="restaurant-outline" size={34} color="#1b5e20" />
            <Text style={styles.topCardText}>Alimentação</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topCard} onPress={handleNavigateToTreino}>
            <Ionicons name="barbell-outline" size={34} color="#1b5e20" />
            <Text style={styles.topCardText}>Treino</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Alimentação */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Minha alimentação</Text>
          {dailyMeals.map((meal: Meal) => (
            <View key={meal.id} style={styles.mealItemCard}>
              <View style={styles.mealItemInfo}>
                <OptimizedImage source={meal.image} style={styles.mealImage} />
                <View style={styles.mealTextContainer}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDescription} numberOfLines={1}>{meal.description}</Text>
                </View>
              </View>
              <View style={styles.mealItemAction}>
                <Text style={styles.mealTime}>{meal.time}</Text>
                <TouchableOpacity onPress={() => handleOpenMealModal(meal.name)} style={styles.openButton}>
                  <Text style={styles.openButtonText}>Abrir</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Seção de Treinos */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Meu treino</Text>
          <View style={styles.workoutLink}>
            <Text style={styles.workoutLinkText}>Lista de treinos</Text>
            <TouchableOpacity onPress={handleOpenWorkoutList} style={styles.abrirButton}>
              <Text style={styles.abrirButtonText}>Abrir</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.workoutLink}>
            <Text style={styles.workoutLinkText}>Planejamento da semana</Text>
            <TouchableOpacity onPress={handleOpenWeekPlanning} style={styles.abrirButton}>
              <Text style={styles.abrirButtonText}>Abrir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dicas de saúde */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dicas de saúde</Text>
          <TouchableOpacity style={styles.healthTipCard} onPress={changeHealthTip} activeOpacity={0.7}>
            <View style={styles.heartIconContainer}>
              <Ionicons name="heart" size={24} color="#2e7d32" />
            </View>
            <Text style={styles.healthTipText}>{healthTips[currentTipIndex]}</Text>
          </TouchableOpacity>
        </View>

        {/* Espaço final reduzido */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Cards superiores
  topCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  topCard: {
    backgroundColor: '#f1f1f1',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  topCardText: {
    marginTop: 8,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
    color: '#323233',
  },

  // Títulos e seções
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 12,
  },
  sectionAgenda: {
    marginTop: 35,
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 12,
  },

  // Alimentação
  mealItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealItemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mealImage: { width: 55, height: 55, borderRadius: 10, marginRight: 15 },
  mealTextContainer: { flex: 1, paddingRight: 10 },
  mealName: { fontWeight: '700', fontSize: 16, color: '#323233' },
  mealDescription: { color: '#777', fontSize: 14 },
  mealItemAction: { alignItems: 'flex-end' },
  mealTime: { color: '#777', marginBottom: 6, fontSize: 13 },
  openButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openButtonText: { color: '#fff', fontWeight: 'bold', marginRight: 5, fontSize: 14 },

  // Treinos
  workoutLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 6,
  },
  workoutLinkText: { fontSize: 16, color: '#323233', fontWeight: '500' },
  abrirButton: {
    backgroundColor: '#3fc271ff',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 22,
    elevation: 2,
  },
  abrirButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Dicas de saúde
  healthTipCard: {
    backgroundColor: '#e6e6e6',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  heartIconContainer: { marginRight: 12 },
  healthTipText: { flex: 1, color: '#666', fontSize: 15, lineHeight: 22 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    maxHeight: '80%',
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1b5e20' },
  closeButton: { padding: 5 },
  modalTotalKcal: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  foodListContainer: { maxHeight: 300 },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodName: { fontSize: 16, flex: 1, color: '#333' },
  foodKcal: { fontSize: 16, color: '#777', marginLeft: 10 },
  emptyFoodText: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
    fontSize: 16,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionButtonText: { marginLeft: 8, color: '#1b5e20', fontWeight: 'bold' },
  clearButton: { backgroundColor: '#fbeae5' },
});

export default DiaryScreen;
