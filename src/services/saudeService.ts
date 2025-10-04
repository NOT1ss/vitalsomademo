// src/services/saudeService.ts
import { Alimento } from '../models/alimentoModel';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import supabase from '../supabaseClient';

const getAuthUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user.id;
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const getUserProfile = async () => {
  const authUuid = await getAuthUserId();
  const { data, error } = await supabase.from('usuarios').select('*').eq('auth_uuid', authUuid).single();
  if (error) { 
    console.error("Erro ao buscar perfil:", error.message); 
    return null; 
  }
  return data;
};

export const getDailySummary = async (date: string) => {
  const profile = await getUserProfile();
  if (!profile) throw new Error("Perfil não encontrado");

  const { data, error } = await supabase
    .from('daily_summary')
    .select('calories_consumed, training_completed')
    .eq('usuario_id', profile.id)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar resumo diário:", error.message);
    throw new Error(error.message);
  }

  return {
    caloriesConsumed: data?.calories_consumed ?? 0,
    trainingCompleted: data?.training_completed ?? false,
  };
};

export const updateDailySummary = async (numericUserId: number, updates: { calories_consumed?: number; training_completed?: boolean }, date?: string) => {
  const targetDate = date || getTodayDateString();
  const { error } = await supabase.from('daily_summary')
    .upsert({ usuario_id: numericUserId, date: targetDate, ...updates }, { onConflict: 'usuario_id, date' });
  
  if (error) { throw new Error(error.message); }
};

export const saveHealthMetric = async (percentage: number) => {
  const profile = await getUserProfile();
  if (!profile) throw new Error("Perfil não encontrado");

  const todayString = getTodayDateString();

  const { error } = await supabase
    .from('grafico_saude')
    .upsert({
      usuario_id: profile.id,
      percentual: percentage,
      data_analise: todayString
    }, { onConflict: 'usuario_id, data_analise' });

  if (error) {
    console.error("Erro ao salvar métrica de saúde:", error.message);
    throw new Error(error.message);
  }
};

// --- FUNÇÕES DE TREINO ---

export const hasTrainingForDate = async (date: string): Promise<boolean> => {
    const profile = await getUserProfile();
    if (!profile) return false;
  
    const { count, error } = await supabase
      .from('ficha_treino')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', profile.id)
      .eq('data_registro', date);
  
    if (error) {
      console.error("Erro ao verificar treinos do dia:", error);
      return false;
    }
    
    return (count ?? 0) > 0;
};

export const saveExercisesForDate = async (date: string, exercicios: ExercicioCompleto[]) => {
    const profile = await getUserProfile();
    if (!profile) throw new Error("Perfil não encontrado");
  
    const { error: deleteError } = await supabase
      .from('ficha_treino')
      .delete()
      .eq('usuario_id', profile.id)
      .eq('data_registro', date);
  
    if (deleteError) {
      console.error("Erro ao deletar treinos antigos:", deleteError);
      throw deleteError;
    }
  
    const novosExercicios = exercicios.map(ex => ({
      usuario_id: profile.id,
      data_registro: date,
      atividade: ex.nome,
      progresso: `Séries: ${ex.series}, Repetições: ${ex.repeticoes}, Carga: ${ex.carga}`
    }));
  
    if (novosExercicios.length > 0) {
      const { error: insertError } = await supabase
        .from('ficha_treino')
        .insert(novosExercicios);
  
      if (insertError) {
        console.error("Erro ao salvar novos treinos:", insertError);
        throw insertError;
      }
    }
};

export const deleteSingleExercise = async (exerciseId: number) => {
  const { error } = await supabase
    .from('ficha_treino')
    .delete()
    .eq('id', exerciseId);

  if (error) {
    console.error("Erro ao deletar exercício:", error.message);
    throw error;
  }
};

export const updateExerciseLog = async (exerciseLogId: number, updates: { carga?: string; series?: string; repeticoes?: string; }) => {
  // Constrói o objeto de progresso a partir das atualizações
  const progressoUpdate = `Séries: ${updates.series}, Repetições: ${updates.repeticoes}, Carga: ${updates.carga}`;

  const { error } = await supabase
    .from('ficha_treino')
    .update({ progresso: progressoUpdate })
    .eq('id', exerciseLogId);

  if (error) {
    console.error("Erro ao atualizar log de exercício:", error.message);
    throw error;
  }
};

export const calculateTrainingStreak = async (): Promise<number> => {
  const profile = await getUserProfile();
  if (!profile) return 0;

  // Fetch ALL completed training dates, sorted descending
  const { data, error } = await supabase
    .from('daily_summary')
    .select('date')
    .eq('usuario_id', profile.id)
    .eq('training_completed', true)
    .order('date', { ascending: false });

  if (error || !data || data.length === 0) {
    return 0;
  }

  const trainingDates = data.map(d => new Date(d.date + 'T00:00:00'));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const mostRecentTraining = trainingDates[0];

  // If the most recent training day wasn't today or yesterday, the streak is 0
  if (mostRecentTraining.getTime() !== today.getTime() && mostRecentTraining.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  // Start from the second date in the list
  for (let i = 1; i < trainingDates.length; i++) {
    const lastDate = trainingDates[i - 1];
    const currentDate = trainingDates[i];

    // Calculate the expected previous day
    const expectedPreviousDate = new Date(lastDate);
    expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);

    // If the current date in the list matches the expected previous day, continue streak
    if (currentDate.getTime() === expectedPreviousDate.getTime()) {
      streak++;
    } else {
      // If it's not consecutive, the streak is broken
      break;
    }
  }

  return streak;
};



// --- Funções de Alimentos ---
export const getTodaysConsumedFoods = async (numericUserId: number) => {
  const date = getTodayDateString();
  const { data, error } = await supabase.from('consumed_foods').select('id, meal_name, food_id, food_name, kcal').eq('usuario_id', numericUserId).eq('date', date);
  if (error) { console.error("Erro ao buscar alimentos:", error); return []; }
  return data;
};

export const addConsumedFood = async (numericUserId: number, mealName: string, food: Alimento) => {
  const { data, error } = await supabase.from('consumed_foods').insert({ usuario_id: numericUserId, date: getTodayDateString(), meal_name: mealName, food_id: food.id, food_name: food.name, kcal: food.kcal }).select('id').single();
  if (error) { throw error; }
  return { ...food, db_id: data.id };
};

export const removeConsumedFood = async (db_id: number) => {
  const { error } = await supabase.from('consumed_foods').delete().eq('id', db_id);
  if (error) { throw error; }
};

export const clearConsumedFoodsByMeal = async (numericUserId: number, mealName: string) => {
  const { error } = await supabase.from('consumed_foods').delete().eq('usuario_id', numericUserId).eq('date', getTodayDateString()).eq('meal_name', mealName);
  if (error) { throw error; }
};

/**
 * Atualiza os dados do perfil do usuário na tabela 'usuarios'.
 * @param updates Um objeto com os campos a serem atualizados.
 */
export const updateUserProfile = async (updates: { daily_calorie_goal?: number; /* etc */ }) => {
  const profile = await getUserProfile();
  if (!profile) throw new Error("Perfil não encontrado");

  const { error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', profile.id);

  if (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    throw new Error(error.message);
  }

  
};


/**
 * Busca todos os exercícios registrados pelo usuário dentro de um período.
 * @param startDate A data de início no formato 'YYYY-MM-DD'.
 * @param endDate A data de fim no formato 'YYYY-MM-DD'.
 * @returns Um array com os exercícios encontrados.
 */
export const getTrainingsForDateRange = async (startDate: string, endDate: string) => {
  const profile = await getUserProfile();
  if (!profile) {
    console.error("getTrainingsForDateRange: Perfil não encontrado");
    return [];
  }

  const { data, error } = await supabase
    .from('ficha_treino')
    .select('id, atividade, progresso, data_registro')
    .eq('usuario_id', profile.id)
    .gte('data_registro', startDate)
    .lte('data_registro', endDate);

  if (error) {
    console.error("Erro ao buscar treinos da semana:", error.message);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Busca todos os recordes pessoais de um usuário da tabela 'records'.
 * @returns Um Map onde a chave é o 'tipo' (nome do exercício) e o valor é o 'valor' (recorde).
 */
export const getPersonalRecords = async (): Promise<Map<string, string>> => {
  const profile = await getUserProfile();
  if (!profile) return new Map();

  const { data, error } = await supabase
    .from('records')
    .select('tipo, valor')
    .eq('usuario_id', profile.id);

  if (error) {
    console.error("Erro ao buscar recordes:", error.message);
    return new Map();
  }

  const recordsMap = new Map<string, string>();
  data.forEach(record => {
    recordsMap.set(record.tipo, record.valor);
  });
  return recordsMap;
};

/**
 * Atualiza (ou insere) um recorde na tabela 'records' usando a operação 'upsert'.
 * @param exerciseName O nome do exercício (coluna 'tipo').
 * @param newRecordValue O novo valor do recorde (coluna 'valor').
 */
export const updatePersonalRecord = async (exerciseName: string, newRecordValue: string) => {
  const profile = await getUserProfile();
  if (!profile) throw new Error("Perfil não encontrado");

  // Usa 'upsert' para inserir um novo recorde ou atualizar um existente
  // em uma única operação atômica. Isso evita race conditions e é mais eficiente.
      const d = new Date();
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const data_registro = `${year}-${month}-${day}`;

      const { error } = await supabase
    .from('records')
    .upsert({
      usuario_id: profile.id,
      tipo: exerciseName,
      valor: newRecordValue,
      data_registro: data_registro
    }, {
      // 'onConflict' especifica as colunas que têm uma restrição UNIQUE.
      // Se um registro com a mesma combinação de 'usuario_id' e 'tipo' já existir,
      // o Supabase fará um UPDATE em vez de um INSERT.
      onConflict: 'usuario_id, tipo'
    });

  if (error) {
    console.error("Erro ao fazer upsert do recorde:", error.message);
    throw error;
  }
};