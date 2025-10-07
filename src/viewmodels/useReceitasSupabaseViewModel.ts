
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback, useEffect } from 'react';
import supabase from '../supabaseClient';
import { Alert } from 'react-native';
import { addFavorite, getFavoriteRecipeIds, getFavoriteRecipes, getUserProfile, removeFavorite } from '../services/saudeService';

// Define a interface para um único objeto de receita
export interface Receita {
  id: number;
  titulo: string;
  categoria: string;
  ingredientes: string;
  preparo: string;
  imagem_url: string;
  titulo_pt: string;
  ingredientes_pt: string;
  preparo_pt: string;
}

interface UserProfile {
  id: number;
}

export const useReceitasSupabaseViewModel = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [receita, setReceita] = useState<Receita | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const profile = await getUserProfile();
        setUserProfile(profile);
        if (profile) {
          const favIds = await getFavoriteRecipeIds(profile.id);
          setFavoriteIds(favIds);
        }
      };
      loadUserData();
    }, [])
  );

  const fetchReceitasPorCategoria = useCallback(async (categoria: string) => {
    setIsLoading(true);
    console.log(`Buscando receitas para a categoria: ${categoria}`); // Log da categoria
    try {
      const { data, error } = await supabase
        .from('receita')
        .select('id, titulo, categoria, ingredientes, preparo, imagem_url, titulo_pt, ingredientes_pt, preparo_pt')
        .eq('categoria', categoria);

      if (error) {
        console.error('Supabase error:', error.message); // Log do erro
        throw error;
      }
      
      console.log('Dados recebidos do Supabase:', data); // Log dos dados
      setReceitas(data || []);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar as receitas.');
      console.error('Error fetching recipes by category:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReceitaPorId = useCallback(async (id: number) => {
    setIsLoading(true);
    console.log(`Buscando receita com ID: ${id}`); // Log do ID
    try {
      const { data, error } = await supabase
        .from('receita')
        .select('id, titulo, categoria, ingredientes, preparo, imagem_url, titulo_pt, ingredientes_pt, preparo_pt')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error.message); // Log do erro
        throw error;
      }

      console.log('Dados recebidos do Supabase para o ID:', data); // Log dos dados
      setReceita(data || null);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da receita.');
      console.error('Error fetching recipe by id:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (receitaId: number) => {
    if (!userProfile) return;

    const currentFavorites = new Set(favoriteIds);
    if (currentFavorites.has(receitaId)) {
      await removeFavorite(userProfile.id, receitaId);
      currentFavorites.delete(receitaId);
    } else {
      await addFavorite(userProfile.id, receitaId);
      currentFavorites.add(receitaId);
    }
    setFavoriteIds(currentFavorites);
  }, [userProfile, favoriteIds]);

  const fetchFavoriteRecipes = useCallback(async () => {
    if (!userProfile) return;
    setIsLoading(true);
    try {
      const data = await getFavoriteRecipes(userProfile.id);
      setReceitas(data || []);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar as receitas favoritas.');
      console.error('Error fetching favorite recipes:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  return {
    receitas,
    receita,
    isLoading,
    favoriteIds,
    fetchReceitasPorCategoria,
    fetchReceitaPorId,
    toggleFavorite,
    fetchFavoriteRecipes,
  };
};
