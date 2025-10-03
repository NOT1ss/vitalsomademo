import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface Props {
  mealName: string;
  consumedKcal: number;
  onPress: () => void;
}

const MEAL_GOAL_KCAL = 625; // Meta aproximada de 25% de 2500kcal

const MealProgressCard: React.FC<Props> = ({ mealName, consumedKcal, onPress }) => {
  const fill = (consumedKcal / MEAL_GOAL_KCAL) * 100;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <AnimatedCircularProgress
        size={120}
        width={10}
        fill={fill > 100 ? 100 : fill}
        tintColor="#34D399"
        backgroundColor="rgba(255, 255, 255, 0.2)"
        rotation={0}
        lineCap="round"
      >
        {() => (
          <>
            <Text style={styles.mealName}>{mealName}</Text>
            <Text style={styles.kcalText}>{Math.round(consumedKcal)} kcal</Text>
          </>
        )}
      </AnimatedCircularProgress>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: '48%', alignItems: 'center', marginBottom: 20 },
  mealName: { color: '#a0d1c3', fontSize: 14 },
  kcalText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
});

export default MealProgressCard;