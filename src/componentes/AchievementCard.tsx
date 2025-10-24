import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface AchievementCardProps {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  message: string;
  highlight: string;
  onDismiss: (id: string) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ id, icon, iconColor, title, message, highlight, onDismiss }) => {

  const handleDismiss = () => {
    onDismiss(id);
  };

  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={28} color={iconColor} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={[styles.message, styles.highlight]}>{highlight}</Text>
      </View>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <View style={styles.closeButtonDot} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 5,
  },
  closeButtonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f87171', // red-400
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#4b5563', // gray-600
    textAlign: 'center',
  },
  highlight: {
    color: '#16a34a', // green-600
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default AchievementCard;
