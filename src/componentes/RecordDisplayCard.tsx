import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordDisplayCardProps {
  exercicio: string;
  valor: string;
}

const RecordDisplayCard: React.FC<RecordDisplayCardProps> = ({ exercicio, valor }) => {
  return (
    <View style={styles.card}>
      <Ionicons name="trophy-outline" size={24} color="#FFC107" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.exercicioText}>{exercicio}</Text>
        <Text style={styles.valorText}>{valor}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    borderColor: '#eee',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  exercicioText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  valorText: {
    fontSize: 14,
    color: '#555',
  },
});

export default RecordDisplayCard;
