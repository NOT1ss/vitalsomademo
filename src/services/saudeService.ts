// src/services/saudeService.ts
import { Alimento } from '../models/alimentoModel';
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
  if (error) { console.error("Erro ao buscar perfil:", error.message); return null; }
  return data;
};

// --- FUNÇÃO ADICIONADA DE VOLTA ---
/**
 * Busca o registro de resumo de hoje (calorias e treino).
 * Se não existir, retorna um objeto padrão com valores zerados.
 */
export const getTodaySummary = async (numericUserId: number) => {
  const date = getTodayDateString();
  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .eq('usuario_id', numericUserId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignora erro "not found", mas loga outros
    console.error("Erro ao buscar resumo diário:", error);
  }
  
  // Se não encontrou (data is null) ou deu erro, retorna um objeto padrão
  return data || { calories_consumed: 0, training_completed: false };
};

export const updateDailySummary = async (numericUserId: number, updates: { calories_consumed?: number; training_completed?: boolean }) => {
  const date = getTodayDateString();
  const { error } = await supabase.from('daily_summary')
    .upsert({ usuario_id: numericUserId, date, ...updates }, { onConflict: 'usuario_id, date' });
  
  if (error) { throw new Error(error.message); }
};

// Funções para a lista de alimentos
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