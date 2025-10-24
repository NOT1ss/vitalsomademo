import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alimento } from '../models/alimentoModel';

interface Props {
  food: Alimento;
  onAdd: (food: Alimento) => void;
}

const AlimentoCard: React.FC<Props> = ({ food, onAdd }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.infoContainer}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodInfo}>
          {food.kcal} kcal | {food.base_g} g
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => onAdd(food)}>
        <Ionicons name="add" size={28} color="#1e6a43" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  foodName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  foodInfo: {
    color: '#d4edda',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlimentoCard;