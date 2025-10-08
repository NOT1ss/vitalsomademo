// src/viewmodels/SaudeViewModel.ts
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { RootStackParamList } from "../navigation/types";
import { getDailySummary, getUserProfile, saveHealthMetric } from "../services/saudeService";

type SaudeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const useSaudeViewModel = () => {
  const navigation = useNavigation<SaudeScreenNavigationProp>();
  
  const [healthPercent, setHealthPercent] = useState(0);
  const [nutritionScore, setNutritionScore] = useState(0);
  const [trainingScore, setTrainingScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingKcal, setRemainingKcal] = useState(0);

  const handleCalculateHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      
      if (!profile || !profile.daily_calorie_goal) {
        Alert.alert("Meta não definida", "Por favor, defina sua meta diária de calorias no seu perfil para continuar.");
        setIsLoading(false);
        return;
      }
      const calorieGoal = profile.daily_calorie_goal;

      const todayString = new Date().toISOString().split('T')[0];
      
      const summary = await getDailySummary(todayString);

      setRemainingKcal(calorieGoal - summary.caloriesConsumed);

      let calculatedNutritionScore = 0;
      if (summary.caloriesConsumed <= calorieGoal) {
        calculatedNutritionScore = Math.round((summary.caloriesConsumed / calorieGoal) * 100);
      } else {
        const overage = summary.caloriesConsumed - calorieGoal;
        const penalty = Math.round((overage / calorieGoal) * 100);
        calculatedNutritionScore = Math.max(0, 100 - penalty);
      }

      const calculatedTrainingScore = summary.trainingCompleted ? 100 : 0;
      
      setNutritionScore(calculatedNutritionScore);
      setTrainingScore(calculatedTrainingScore);

      const finalPercentage = (calculatedNutritionScore * 0.5) + (calculatedTrainingScore * 0.5);
      const roundedPercentage = Math.round(finalPercentage);

      setHealthPercent(roundedPercentage);
      await saveHealthMetric(roundedPercentage);
      
    } catch (error: any) {
      console.error("Erro ao calcular saúde:", error);
      Alert.alert("Erro", "Não foi possível calcular seu status de saúde. Tente novamente.");
      setHealthPercent(0);
      setNutritionScore(0);
      setTrainingScore(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    // @ts-ignore
    navigation.navigate(screenName);
  };

  return { 
    navigateToScreen,
    handleCalculateHealth,
    healthPercent,
    nutritionScore,
    trainingScore,
    isLoading,
    remainingKcal,
  };
};