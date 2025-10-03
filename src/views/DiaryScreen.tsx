import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OptimizedImage from '../componentes/OptimizedImage';
// CORREÇÃO: Importa o ViewModel como padrão E o tipo 'Meal' que ele agora exporta
import useDiaryViewModel, { Meal } from '../viewmodels/DiaryViewModel';

const DiaryScreen = () => {
  const {
    meals,
    healthTips,
    currentTipIndex,
    handleOpenMealDetails,
    handleOpenWorkoutList,
    handleOpenWeekPlanning,
    handleNavigateToAlimentacao,
    handleNavigateToTreino,
  } = useDiaryViewModel();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.topCardContainer}>
          <TouchableOpacity style={styles.topCard} onPress={handleNavigateToAlimentacao}>
            <Ionicons name="restaurant-outline" size={32} color="black" />
            <Text style={styles.topCardText} numberOfLines={1} adjustsFontSizeToFit>Alimentação</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topCard} onPress={handleNavigateToTreino}>
            <Ionicons name="barbell-outline" size={32} color="black" />
            <Text style={styles.topCardText} numberOfLines={1} adjustsFontSizeToFit>Treino</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topCard}>
            <Ionicons name="heart-outline" size={32} color="black" />
            <Text style={styles.topCardText} numberOfLines={1} adjustsFontSizeToFit>Saúde</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minha alimentação</Text>
            <TouchableOpacity onPress={handleNavigateToAlimentacao}>
              <Text style={styles.verText}>ver</Text>
            </TouchableOpacity>
          </View>
          {meals.map((meal: Meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View style={styles.mealInfo}>
                {meal.image && (
                  <OptimizedImage 
                    source={meal.image} 
                    style={styles.mealImage}
                    showLoader={true} showFallback={true} loaderColor="#1e6a43"
                    fallbackIconName="restaurant-outline" fallbackIconColor="#999" fallbackIconSize={20}
                  />
                )}
                <View style={styles.mealTextContainer}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDescription} numberOfLines={1} ellipsizeMode="tail">{meal.description}</Text>
                </View>
              </View>
              <View style={styles.mealAction}>
                <Text style={styles.mealTime}>{meal.time}</Text>
                <TouchableOpacity onPress={() => handleOpenMealDetails(meal)} style={styles.openButton}>
                  <Text style={styles.openButtonText}>Abrir</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

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

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dicas de saúde</Text>
          <View style={styles.healthTipCard}>
            <View style={styles.heartIconContainer}>
              <Ionicons name="heart" size={24} color="#000" />
            </View>
            <Text style={styles.healthTipText}>{healthTips[currentTipIndex]}</Text>
          </View>
        </View>
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff', },
  container: { flex: 1, paddingHorizontal: 20, },
  topCardContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, },
  topCard: { backgroundColor: '#d4edda', borderRadius: 15, paddingVertical: 20, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', width: '30%', },
  topCardText: { marginTop: 8, fontWeight: 'bold', textAlign: 'center', },
  sectionContainer: { marginBottom: 30, },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e6a43', },
  verText: { color: '#1e6a43', fontWeight: 'bold' },
  mealItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, },
  mealImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15, },
  mealInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, },
  mealTextContainer: { flex: 1, paddingRight: 10, },
  mealName: { fontWeight: 'bold' },
  mealDescription: { color: 'gray' },
  mealAction: { flexDirection: 'column', alignItems: 'flex-end', },
  mealTime: { color: 'gray', marginBottom: 5, },
  openButton: { backgroundColor: '#1e6a43', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  openButtonText: { color: '#fff', marginRight: 5, },
  workoutLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', },
  workoutLinkText: { fontSize: 16, },
  abrirButton: { backgroundColor: '#d4edda', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, },
  abrirButtonText: { color: '#1e6a43', fontWeight: 'bold', },
  healthTipCard: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 15, flexDirection: 'row', alignItems: 'center', marginTop: 10, },
  heartIconContainer: { marginRight: 15, },
  healthTipText: { flex: 1, color: 'gray', },
});

export default DiaryScreen;