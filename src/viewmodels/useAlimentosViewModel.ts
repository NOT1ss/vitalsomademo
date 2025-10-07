import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { Alimento } from '../models/alimentoModel';

export const useAlimentosViewModel = () => {
  const navigation = useNavigation();
  
  const [allFoods, setAllFoods] = useState<Alimento[] | null>(null);
  const [displayedFoods, setDisplayedFoods] = useState<Alimento[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        const { data, error } = await supabase
          .from('alimentos')
          .select('id, nome_alimento, kcal, proteina');

        if (error) {
          throw error;
        }

        if (data) {
          const alimentos = data.map((item: any) => ({
            id: item.id.toString(),
            name: item.nome_alimento || '',
            kcal: parseFloat(item.kcal) || 0,
            protein: parseFloat(item.proteina) || 0,
            base_g: 100, 
            carbs: 0,
            fat: 0,
          }));
          setAllFoods(alimentos);
        } else {
          setAllFoods([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlimentos();
  }, []);

  useEffect(() => {
    if (allFoods === null) {
      setDisplayedFoods([]);
      return;
    }
    if (searchText.trim() === '') {
      setDisplayedFoods(allFoods.slice(0, 50));
    } else {
      const filteredFoods = allFoods.filter((food) =>
        (food.name || '').toLowerCase().includes(searchText.toLowerCase())
      );
      setDisplayedFoods(filteredFoods);
    }
  }, [searchText, allFoods]);

  const handleAddFood = (food: Alimento) => {
    console.log('Adicionar Alimento:', food.name);
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFavoritesPress = () => {
    console.log('Navegando para Favoritas');
    // No futuro: navigation.navigate('Favoritas');
  };

  return {
    displayedFoods,
    searchText,
    setSearchText,
    handleAddFood,
    handleGoBack,
    handleFavoritesPress,
    loading,
    error,
  };
};