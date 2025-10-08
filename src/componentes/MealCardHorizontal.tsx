import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MealCardHorizontalProps {
  mealName: string;
  kcal: number;
  items: number;
}

const MealCardHorizontal: React.FC<MealCardHorizontalProps> = ({
  mealName,
  kcal,
  items,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.mealName}>{mealName}</Text>
      <View style={styles.contentRow}>
        <View style={styles.section}>
          <Text style={styles.label}>Calorias</Text>
          <Text style={styles.value}>{kcal}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Itens</Text>
          <Text style={styles.value}>{items}</Text>
        </View>
      </View>
      <Text style={styles.detailsText}>Ver detalhes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d3d3d3',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    alignItems: 'flex-start',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  buttonSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 14,
    color: '#1e6a43',
    fontWeight: 'bold',
    marginTop: 2,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailsText: {
    fontSize: 12,
    color: '#1e6a43',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MealCardHorizontal;

