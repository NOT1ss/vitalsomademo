import { useNavigation } from '@react-navigation/native'; // IMPORTAR
import { useEffect, useState } from 'react';
import { Alimento, tacoFoods } from '../models/alimentoModel';

export const useAlimentosViewModel = () => {
  const navigation = useNavigation(); // USAR O HOOK DE NAVEGAÇÃO
  
  const [allFoods] = useState<Alimento[]>(tacoFoods);
  const [displayedFoods, setDisplayedFoods] = useState<Alimento[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (searchText.trim() === '') {
      setDisplayedFoods(allFoods.slice(0, 50));
    } else {
      const filteredFoods = allFoods.filter((food) =>
        food.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setDisplayedFoods(filteredFoods);
    }
  }, [searchText, allFoods]);

  const handleAddFood = (food: Alimento) => {
    console.log('Adicionar Alimento:', food.name);
  };
  
  // --- INÍCIO DA ALTERAÇÃO ---
  // NOVA FUNÇÃO PARA VOLTAR
  const handleGoBack = () => {
    navigation.goBack();
  };

  // NOVA FUNÇÃO PARA FAVORITOS
  const handleFavoritesPress = () => {
    console.log('Navegando para Favoritas');
    // No futuro: navigation.navigate('Favoritas');
  };
  // --- FIM DA ALTERAÇÃO ---

  return {
    displayedFoods,
    searchText,
    setSearchText,
    handleAddFood,
    // --- INÍCIO DA ALTERAÇÃO ---
    // EXPORTAR AS NOVAS FUNÇÕES
    handleGoBack,
    handleFavoritesPress,
    // --- FIM DA ALTERAÇÃO ---
  };
};