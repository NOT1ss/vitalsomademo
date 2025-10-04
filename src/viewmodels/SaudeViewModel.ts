// src/viewmodels/SaudeViewModel.ts
import { useCallback, useState } from 'react';
// CORREÇÃO AQUI: Importa a nova função
import { getTodaySummary, getUserProfile } from '../services/saudeService';

export const useSaudeViewModel = () => {
  const [overallHealth, setOverallHealth] = useState(0);
  const [nutrition, setNutrition] = useState(0);
  const [training, setTraining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');

  const calculateHealthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const userProfile = await getUserProfile();
      if (!userProfile) {
        setIsLoading(false); return;
      }
      setUserName(userProfile.nome || 'Usuário');

      // CORREÇÃO AQUI: Usa a nova função
      const dailySummary = await getTodaySummary(userProfile.id);

      const calorieGoal = userProfile.daily_calorie_goal || 2000;
      const caloriesConsumed = dailySummary.calories_consumed || 0;
      const nutritionPercentage = Math.min((caloriesConsumed / calorieGoal) * 100, 100);
      setNutrition(Math.round(nutritionPercentage));

      const trainingCompleted = dailySummary.training_completed || false;
      const trainingPercentage = trainingCompleted ? 100 : 0;
      setTraining(trainingPercentage);

      const overallPercentage = (nutritionPercentage * 0.6) + (trainingPercentage * 0.4);
      setOverallHealth(Math.round(overallPercentage));

    } catch (error) {
      console.error("Erro ao calcular saúde:", error);
      setOverallHealth(0); setNutrition(0); setTraining(0);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    userName,
    overallHealthPercentage: overallHealth,
    nutritionPercentage: nutrition,
    trainingPercentage: training,
    isLoading,
    onOptimizePress: calculateHealthStatus,
    fetchData: calculateHealthStatus,
  };
};