import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Alimento } from '../models/alimentoModel';
import { RootStackParamList } from '../navigation/types';
import { clearConsumedFoodsByMeal, getDicasSaude, getTodaysConsumedFoods, getUserProfile } from '../services/saudeService';
import supabase from '../supabaseClient';

// Interfaces
export type FoodWithDbId = Alimento & { db_id: number };
export interface Meal {
  id: string;
  name: 'Café da manhã' | 'Almoço' | 'Jantar' | 'Lanches';
  foods: FoodWithDbId[];
  image: any; // Manter a imagem estática
  description: string;
  time: string;
}
type DiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainApp'>;
interface UserProfile { id: number; }

const useDiaryViewModel = () => {
  const navigation = useNavigation<DiaryScreenNavigationProp>();

  // States
  const [dailyMeals, setDailyMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [healthTips, setHealthTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Efeito para carregar os dados
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Busca as dicas de saúde em paralelo com outras chamadas
          const [alimentosData, dicas] = await Promise.all([
            supabase.from('alimentos').select('id, nome_alimento, kcal, proteina'),
            getDicasSaude()
          ]);

          if (alimentosData.error) throw alimentosData.error;
          setHealthTips(dicas.length > 0 ? dicas : ['Mantenha-se hidratado e tenha um ótimo dia!']); // Fallback

          const foods = alimentosData.data.map((item: any) => ({
            id: item.id.toString(),
            name: item.nome_alimento || '',
            kcal: parseFloat(item.kcal) || 0,
            protein: parseFloat(item.proteina) || 0,
            base_g: 100,
            carbs: 0,
            fat: 0,
          }));

          const profile = await getUserProfile();
          if (profile) {
            setUserProfile(profile);
            const consumedFoods = await getTodaysConsumedFoods(profile.id);
            
            const meals: Meal[] = [
              { id: '1', name: 'Café da manhã', foods: [], image: require('../../assets/images/cafemanha.jpg'), description: 'Comece bem o dia', time: '8:00' },
              { id: '2', name: 'Almoço', foods: [], image: require('../../assets/images/almoco.jpeg'), description: 'A principal refeição do dia', time: '12:00' },
              { id: '3', name: 'Jantar', foods: [], image: require('../../assets/images/janta.jpg'), description: 'Uma refeição leve para a noite', time: '20:00' },
              { id: '4', name: 'Lanches', foods: [], image: require('../../assets/images/imagejoia.png'), description: 'Pequenas pausas para recarregar', time: 'A qualquer hora' },
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
              const fullFoodData = foods.find(f => f.id === foodFromDb.food_id);
              if (meal && fullFoodData) {
                meal.foods.push({ ...fullFoodData, db_id: foodFromDb.id });
              }
            });
            setDailyMeals(meals);
          }
        } catch (e: any) {
          console.error(e);
          Alert.alert('Erro', 'Não foi possível carregar os dados do diário.');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  // Efeito para o carrossel de dicas
  useEffect(() => {
    if (healthTips.length === 0) return;
    const timer = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % healthTips.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [healthTips.length, currentTipIndex]); // Reinicia o timer quando o índice muda

  const changeHealthTip = () => {
    if (healthTips.length <= 1) return;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * healthTips.length);
    } while (newIndex === currentTipIndex);
    setCurrentTipIndex(newIndex);
  };

  // Funções de manipulação do Modal
  const handleOpenMealModal = (mealName: string) => {
    const mealData = dailyMeals.find(m => m.name === mealName);
    if (mealData) {
      setSelectedMeal(mealData);
      setIsModalVisible(true);
    }
  };

  const handleCloseMealModal = () => {
    setIsModalVisible(false);
    setSelectedMeal(null);
  };

  const handleClearMeal = async (mealName: string) => {
    if (!userProfile) return;
    const dbMealName = mealName === 'Lanches' ? 'Lanche' : mealName;
    try {
      await clearConsumedFoodsByMeal(userProfile.id, dbMealName);
      setDailyMeals(current => current.map(m => (m.name === mealName ? { ...m, foods: [] } : m)));
      handleCloseMealModal(); // Fecha o modal após limpar
    } catch (error) {
      console.error("Falha ao limpar refeição:", error);
      Alert.alert('Erro', 'Não foi possível limpar a refeição.');
    }
  };

  const handleNavigateToAddFood = (mealName: string) => {
    handleCloseMealModal();
    navigation.navigate('Receitas', { selectedMeal: mealName });
  };
  
  const handleNavigateToTreino = () => { navigation.navigate('Treino'); };
  const handleNavigateToSaude = () => { navigation.navigate('Saude'); };
  const handleOpenWorkoutList = () => { navigation.navigate('ExerciciosList'); };
  const handleOpenWeekPlanning = () => { navigation.navigate('PlanoSemana'); };

  return {
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
    changeHealthTip, // Exporta a nova função
    navigation,
  };
};

export default useDiaryViewModel;