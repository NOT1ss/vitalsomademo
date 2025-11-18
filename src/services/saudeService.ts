// src/services/saudeService.ts
import { Alimento } from '../models/alimentoModel';
import { ExercicioCompleto } from '../models/semanaTreinoModel';
import supabase from '../supabaseClient';

const getAuthUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user.id;
};

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  console.log(`[getDailySummary] Buscando resumo para a data: ${date}`);
  const profile = await getUserProfile();
  if (!profile) {
    console.error("[getDailySummary] Perfil não encontrado.");
    throw new Error("Perfil não encontrado");
  }
  console.log(`[getDailySummary] Perfil encontrado: ${profile.id}`);

  const { data, error } = await supabase
    .from('daily_summary')
    .select('calories_consumed, training_completed')
    .eq('usuario_id', profile.id)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("[getDailySummary] Erro do Supabase:", error);
    throw new Error(error.message);
  }

  console.log(`[getDailySummary] Dados recebidos do Supabase:`, data);

  const result = {
    caloriesConsumed: data?.calories_consumed ?? 0,
    trainingCompleted: data?.training_completed ?? false,
  };

  console.log(`[getDailySummary] Resultado retornado:`, result);
  return result;
};

export const updateDailySummary = async (numericUserId: number, updates: { calories_consumed?: number; training_completed?: boolean }, date?: string) => {
  const targetDate = date || getTodayDateString();
  console.log(`[updateDailySummary] Iniciando para data: ${targetDate} com updates:`, updates);

  // 1. Verifica se já existe um registro para o usuário e a data
  const { data: existing, error: selectError } = await supabase
    .from('daily_summary')
    .select('usuario_id')
    .eq('usuario_id', numericUserId)
    .eq('date', targetDate)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('[updateDailySummary] Erro ao verificar registro existente:', selectError);
    throw selectError;
  }

  // 2. Se existir, faz UPDATE. Se não, faz INSERT.
  if (existing) {
    console.log('[updateDailySummary] Registro existente encontrado. Fazendo UPDATE.');
    const { error: updateError } = await supabase
      .from('daily_summary')
      .update(updates)
      .match({ usuario_id: numericUserId, date: targetDate });

    if (updateError) {
      console.error('[updateDailySummary] Erro no UPDATE:', updateError);
      throw updateError;
    }
    console.log('[updateDailySummary] UPDATE realizado com sucesso.');

  } else {
    console.log('[updateDailySummary] Nenhum registro existente. Fazendo INSERT.');
    const { error: insertError } = await supabase
      .from('daily_summary')
      .insert({ usuario_id: numericUserId, date: targetDate, ...updates });

    if (insertError) {
      console.error('[updateDailySummary] Erro no INSERT:', insertError);
      throw insertError;
    }
    console.log('[updateDailySummary] INSERT realizado com sucesso.');
  }
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

  console.log('[calculateTrainingStreak] trainingDates:', trainingDates);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  console.log('[calculateTrainingStreak] today:', today);
  console.log('[calculateTrainingStreak] yesterday:', yesterday);

  const mostRecentTraining = trainingDates[0];

  console.log('[calculateTrainingStreak] mostRecentTraining:', mostRecentTraining);

  if (mostRecentTraining.getTime() !== today.getTime() && mostRecentTraining.getTime() !== yesterday.getTime()) {
    console.log('[calculateTrainingStreak] Streak broken, returning 0.');
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < trainingDates.length; i++) {
    const lastDate = trainingDates[i - 1];
    const currentDate = trainingDates[i];
    
    const expectedPreviousDate = new Date(lastDate);
    expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);

    console.log(`[calculateTrainingStreak] Loop ${i}:`);
    console.log(`[calculateTrainingStreak]   lastDate: ${lastDate}`);
    console.log(`[calculateTrainingStreak]   currentDate: ${currentDate}`);
    console.log(`[calculateTrainingStreak]   expectedPreviousDate: ${expectedPreviousDate}`);

    if (currentDate.getTime() === expectedPreviousDate.getTime()) {
      streak++;
      console.log(`[calculateTrainingStreak]   Streak incremented to ${streak}`);
    } else {
      console.log('[calculateTrainingStreak]   Streak broken in loop.');
      break;
    }
  }

  console.log(`[calculateTrainingStreak] Final streak: ${streak}`);

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
export const updateUserProfile = async (updates: { [key: string]: any }) => {
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

import { Buffer } from 'buffer';

export const uploadAvatar = async (base64Uri: string) => {
  try {
    const profile = await getUserProfile();
    if (!profile) throw new Error("Perfil não encontrado");

    // Extrai o conteúdo base64 do data URI
    const base64Data = base64Uri.split('base64,')[1];
    const decodedData = Buffer.from(base64Data, 'base64');

    const fileExt = 'png'; // Assumindo png, pode ser melhorado para detectar o tipo
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, decodedData, { contentType: `image/${fileExt}` });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Erro no upload de avatar:', error);
    throw error;
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

export const deletePersonalRecord = async (exerciseName: string) => {
  const profile = await getUserProfile();
  if (!profile) throw new Error("Perfil não encontrado");

  const { error } = await supabase
    .from('records')
    .delete()
    .match({ usuario_id: profile.id, tipo: exerciseName });

  if (error) {
    console.error("Erro ao deletar recorde:", error.message);
    throw error;
  }
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
    throw error;
  }
};

// --- Funções de Receitas Favoritas ---

export const getFavoriteRecipeIds = async (userId: number): Promise<Set<number>> => {
  const { data, error } = await supabase
    .from('receita_favorita')
    .select('receita_id')
    .eq('usuario_id', userId);

  if (error) {
    console.error("Erro ao buscar IDs de receitas favoritas:", error.message);
    return new Set();
  }

  return new Set(data.map(r => r.receita_id));
};

export const addFavorite = async (userId: number, receitaId: number) => {
  const { error } = await supabase
    .from('receita_favorita')
    .insert({ usuario_id: userId, receita_id: receitaId });

  if (error) {
    console.error("Erro ao adicionar favorito:", error.message);
    throw error;
  }
};

export const removeFavorite = async (userId: number, receitaId: number) => {
  const { error } = await supabase
    .from('receita_favorita')
    .delete()
    .match({ usuario_id: userId, receita_id: receitaId });

  if (error) {
    throw error;
  }
};

export const getFavoriteRecipes = async (userId: number) => {
  const { data: favoriteData, error: favoriteError } = await supabase
    .from('receita_favorita')
    .select('receita_id')
    .eq('usuario_id', userId);

  if (favoriteError) {
    console.error("Erro ao buscar IDs de receitas favoritas:", favoriteError.message);
    return [];
  }

  const recipeIds = favoriteData.map(f => f.receita_id);

  if (recipeIds.length === 0) {
    return [];
  }

  const { data: recipesData, error: recipesError } = await supabase
    .from('receita')
    .select('id, titulo, categoria, ingredientes, preparo, imagem_url, titulo_pt, ingredientes_pt, preparo_pt')
    .in('id', recipeIds);

  if (recipesError) {
    console.error("Erro ao buscar detalhes das receitas favoritas:", recipesError.message);
    return [];
  }

  return recipesData;
};

export const getDicasSaude = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('dicas_saude')
    .select('texto');

  if (error) {
    console.error("Erro ao buscar dicas de saúde:", error.message);
    return []; // Retorna um array vazio em caso de erro
  }

  // Extrai apenas o texto de cada dica
  return data.map(dica => dica.texto);
};

// --- FUNÇÕES DE PONTUAÇÃO ---

/**
 * Adiciona uma quantidade de pontos para um usuário na tabela de ranking.
 * @param userId O ID numérico do usuário (da tabela 'usuarios').
 * @param pointsToAdd A quantidade de pontos a ser adicionada.
 */
export const addPoints = async (userId: number, pointsToAdd: number) => {
  console.log(`[addPoints] Function called with userId: ${userId}, pointsToAdd: ${pointsToAdd}`);
  try {
    console.log(`[addPoints] Adicionando ${pointsToAdd} pontos para o usuário ${userId}`);
    
    // 1. Buscar os pontos atuais do usuário no ranking
    const { data: rankingData, error: selectError } = await supabase
      .from('ranking')
      .select('pontos')
      .eq('usuario_id', userId)
      .single();

    // Se o select der erro (e não for o erro de "nenhuma linha encontrada"), pare a execução.
    if (selectError && selectError.code !== 'PGRST116') throw selectError;

    // 2. Calcular os novos pontos
    const currentPoints = rankingData?.pontos || 0;
    const newPoints = currentPoints + pointsToAdd;

    // 3. Fazer o upsert para atualizar ou inserir o ranking do usuário
    const { error: upsertError } = await supabase
      .from('ranking')
      .upsert({
        usuario_id: userId,
        pontos: newPoints,
        data_atualizacao: new Date().toISOString(),
      }, { onConflict: 'usuario_id' });

    if (upsertError) throw upsertError;

    console.log(`[addPoints] Pontos do usuário ${userId} atualizados para ${newPoints}.`);

  } catch (error) {
    console.error('!!!!!!!!!! [addPoints] FALHA CRÍTICA AO ADICIONAR PONTOS !!!!!!!!!!', error);
    // Optamos por não jogar o erro para cima para não quebrar a UI se a pontuação falhar.
  }
};

/**
 * Subtrai uma quantidade de pontos de um usuário na tabela de ranking.
 * @param userId O ID numérico do usuário.
 * @param pointsToSubtract A quantidade de pontos a ser subtraída.
 */
export const subtractPoints = async (userId: number, pointsToSubtract: number) => {
  try {
    console.log(`[subtractPoints] Removendo ${pointsToSubtract} pontos do usuário ${userId}`);
    
    const { data: rankingData, error: selectError } = await supabase
      .from('ranking')
      .select('pontos')
      .eq('usuario_id', userId)
      .single();

    if (selectError) throw selectError;

    const currentPoints = rankingData?.pontos || 0;
    const newPoints = Math.max(0, currentPoints - pointsToSubtract); // Garante que os pontos não fiquem negativos

    const { error: updateError } = await supabase
      .from('ranking')
      .update({ 
        pontos: newPoints,
        data_atualizacao: new Date().toISOString(),
      })
      .eq('usuario_id', userId);

    if (updateError) throw updateError;

    console.log(`[subtractPoints] Pontos do usuário ${userId} atualizados para ${newPoints}.`);

  } catch (error) {
    console.error('!!!!!!!!!! [subtractPoints] FALHA CRÍTICA AO REMOVER PONTOS !!!!!!!!!!', error);
  }
};

// --- FUNÇÃO DE SINCRONIA DO RANKING ---

/**
 * Garante que todos os usuários na tabela 'usuarios' tenham uma entrada na tabela 'ranking'.
 * Se um usuário não existir no ranking, ele é criado com 0 pontos. NÃO sobrescreve pontos existentes.
 */
export const syncRankingWithUsers = async () => {
  try {
    console.log('[syncRanking] Iniciando...');
    // 1. Buscar todos os IDs da tabela de usuários
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('id');

    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      console.log('[syncRanking] Nenhum usuário encontrado para sincronizar.');
      return;
    }

    // 2. Buscar todos os IDs que JÁ ESTÃO no ranking
    const { data: rankedUsers, error: rankedUsersError } = await supabase
      .from('ranking')
      .select('usuario_id');
    
    if (rankedUsersError) throw rankedUsersError;

    const rankedUserIds = new Set(rankedUsers.map(u => u.usuario_id));
    console.log(`[syncRanking] ${rankedUserIds.size} usuários já existem no ranking.`);

    // 3. Filtrar para encontrar apenas os usuários que ainda não estão no ranking
    const newUsersToInsert = users.filter(user => !rankedUserIds.has(user.id));

    if (newUsersToInsert.length === 0) {
      console.log('[syncRanking] Nenhum usuário novo para adicionar. Sincronização concluída.');
      return;
    }

    console.log(`[syncRanking] Adicionando ${newUsersToInsert.length} novos usuários ao ranking.`);

    // 4. Preparar os dados apenas para os novos usuários
    const newRankingEntries = newUsersToInsert.map(user => ({
      usuario_id: user.id,
      pontos: 0, // Pontuação inicial padrão
      data_atualizacao: new Date().toISOString(),
    }));

    // 5. Inserir APENAS os novos usuários
    const { error: insertError } = await supabase
      .from('ranking')
      .insert(newRankingEntries);

    if (insertError) {
      console.error('[syncRanking] Erro ao inserir novos usuários no ranking:', insertError);
      throw insertError;
    }

    console.log(`[syncRanking] Sincronização do ranking concluída com sucesso.`);

  } catch (error) {
    console.error('[syncRanking] Falha geral na sincronização do ranking:', error);
  }
};
