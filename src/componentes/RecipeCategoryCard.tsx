import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecipeCategory } from '../models/receitaModel';
import OptimizedImage from './OptimizedImage'; // Importe o componente otimizado

interface Props {
  category: RecipeCategory;
  onPress: (category: RecipeCategory) => void;
}

const RecipeCategoryCard: React.FC<Props> = ({ category, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={() => onPress(category)}>
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{category.name}</Text>
      </View>
      <View style={styles.imageContainer}>
        <OptimizedImage 
          source={category.image} 
          style={styles.image}
          showLoader={true}
          showFallback={true}
          loaderColor="#1e6a43"
          fallbackIconName="restaurant-outline"
          fallbackIconColor="#ccc"
          fallbackIconSize={30}
        />
      </View>
      {/* View para criar o efeito da linha diagonal */}
      <View style={styles.diagonalLine} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 130,
    borderRadius: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    overflow: 'hidden', // Essencial para o efeito diagonal funcionar
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  textContainer: {
    flex: 1.2, // Dá mais espaço para o texto
    justifyContent: 'center',
    paddingLeft: 45,
    zIndex: 2, // Garante que o texto fique na frente da linha
  },
  cardText: {
    fontSize: 32,
    fontFamily: 'GreatVibes-Regular', // Você precisa instalar esta fonte!
    color: '#333',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  diagonalLine: {
    position: 'absolute',
    top: -50, // Posição inicial da linha
    left: '35%',
    width: 100,
    height: 250, // Altura da linha
    backgroundColor: 'white',
    transform: [{ rotate: '15deg' }], // Rotação para criar a diagonal
    zIndex: 1,
  },
});

export default RecipeCategoryCard;

