// src/viewmodels/useReceitasViewModel.ts
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alimento, tacoFoods } from '../models/alimentoModel';
import { mockCategories, RecipeCategory } from '../models/receitaModel';
import { RootStackParamList } from '../navigation/types';
import { addConsumedFood, clearConsumedFoodsByMeal, getTodaysConsumedFoods, getUserProfile, removeConsumedFood, updateDailySummary } from '../services/saudeService';

export type FoodWithDbId = Alimento & { db_id: number };
interface Meal { id: string; name: 'Café da manhã' | 'Almoço' | 'Jantar' | 'Lanches'; foods: FoodWithDbId[]; }
export type ActiveTab = 'receitas' | 'alimentos' | 'calorias';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
interface UserProfile { id: number; daily_calorie_goal?: number; }

export const useReceitasViewModel = () => {
  const navigation = useNavigation<NavigationProp>();
  const [categories] = useState<RecipeCategory[]>(mockCategories);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('calorias');
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dailyMeals, setDailyMeals] = useState<Meal[]>([
    { id: '1', name: 'Café da manhã', foods: [] },
    { id: '2', name: 'Almoço', foods: [] },
    { id: '3', name: 'Jantar', foods: [] },
    { id: '4', name: 'Lanches', foods: [] },
  ]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
          const consumedFoods = await getTodaysConsumedFoods(profile.id);
          const meals: Meal[] = [
            { id: '1', name: 'Café da manhã', foods: [] },
            { id: '2', name: 'Almoço', foods: [] },
            { id: '3', name: 'Jantar', foods: [] },
            { id: '4', name: 'Lanches', foods: [] },
          ];

          consumedFoods.forEach(foodFromDb => {
            const mealNameMap: { [key: string]: Meal['name'] } = {
              'Café da Manhã': 'Café da manhã',
              'Café da manhã': 'Café da manhã',
              'Almoço': 'Almoço',
              'Jantar': 'Jantar',
              'Lanche': 'Lanches',
             
            };
            const targetMealName = mealNameMap[foodFromDb.meal_name];
            const meal = meals.find(m => m.name === targetMealName);
            const fullFoodData = tacoFoods.find(f => f.id === foodFromDb.food_id);
            if (meal && fullFoodData) {
              meal.foods.push({ ...fullFoodData, db_id: foodFromDb.id });
            }
          });
          setDailyMeals(meals);
        }
        setIsLoading(false);
      };
      loadData();
    }, [])
  );

  const totalConsumedKcal = useMemo(() => {
    return dailyMeals.reduce((total, meal) => total + meal.foods.reduce((sum, food) => sum + food.kcal, 0), 0);
  }, [dailyMeals]);
  
  useEffect(() => {
    if (!userProfile || isLoading) return;
    updateDailySummary(userProfile.id, { calories_consumed: totalConsumedKcal }).catch(e => console.error(e));
  }, [totalConsumedKcal, userProfile, isLoading]);

  const handleAddFoodToMeal = async (food: Alimento, mealName: string) => {
    if (!userProfile) return;
    try {
      const dbMealName = mealName === 'Lanches' ? 'Lanche' : mealName;
      const addedFood = await addConsumedFood(userProfile.id, dbMealName, food);
      setDailyMeals(current => current.map(m => m.name === mealName ? { ...m, foods: [...m.foods, addedFood] } : m));
      setActiveTab('calorias');
      setSelectedMeal(null);
    } catch (e) { console.error(e) }
  };

  const handleRemoveFoodFromMeal = async (foodToRemove: FoodWithDbId, mealName: string) => {
    await removeConsumedFood(foodToRemove.db_id);
    setDailyMeals(current => current.map(m => m.name === mealName ? { ...m, foods: m.foods.filter(f => f.db_id !== foodToRemove.db_id) } : m));
  };

  const handleClearMeal = async (mealName: string) => {
    if (!userProfile) return;
    // Traduz o nome da UI ("Lanches") para o nome do DB ("Lanche")
    const dbMealName = mealName === 'Lanches' ? 'Lanche' : mealName;
    try {
      await clearConsumedFoodsByMeal(userProfile.id, dbMealName);
      // Atualiza o estado local usando o nome da UI
      setDailyMeals(current => current.map(m => (m.name === mealName ? { ...m, foods: [] } : m)));
    } catch (error) {
      console.error("Falha ao limpar refeição:", error);
    }
  };

  const handleMealCardPress = (mealName: string) => {
    setSelectedMeal(mealName);
    setActiveTab('alimentos');
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== 'alimentos') setSelectedMeal(null);
  };
  
  const handleAddFood = (food: Alimento) => handleAddFoodToMeal(food, selectedMeal || 'Lanches');
  
  const caloriesByMeal = useMemo(() => {
    const totals: { [key: string]: number } = {};
    dailyMeals.forEach(m => { totals[m.name] = m.foods.reduce((s, f) => s + f.kcal, 0); });
    return totals;
  }, [dailyMeals]);

  const calorieGoal = userProfile?.daily_calorie_goal || 2000;
  const remainingKcal = calorieGoal - totalConsumedKcal;
  
  return {
    activeTab, handleTabChange, handleGoBack: navigation.goBack,
    categories, handleCategoryPress: () => {}, searchText, setSearchText, handleClearSearch: () => setSearchText(''),
    displayedFoods: tacoFoods.filter(f => f.name.toLowerCase().includes(searchText.toLowerCase())).slice(0, 50),
    calorieGoal, remainingKcal, totalConsumedKcal, caloriesByMeal, handleMealCardPress, dailyMeals,
    selectedMeal, setSelectedMeal, handleAddFoodToMeal, handleRemoveFoodFromMeal, handleClearMeal, handleAddFood, isLoading
  };
};