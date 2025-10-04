import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { useSaudeViewModel } from '../viewmodels/SaudeViewModel';

// Componente para a Barra de Progresso
const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarLabels}>
        <Text style={styles.progressBarLabel}>{label}</Text>
        <Text style={styles.progressBarValue}>{value}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const SaudeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    healthPercent,
    nutritionScore,
    trainingScore,
    handleCalculateHealth,
    isLoading,
  } = useSaudeViewModel();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      handleCalculateHealth();
    });

    return unsubscribe;
  }, [navigation, handleCalculateHealth]);

  const circularProgressRadius = 100;
  const circularProgressStrokeWidth = 20;
  const circularProgressCircumference = 2 * Math.PI * circularProgressRadius;
  const circularProgressStrokeDashoffset =
    circularProgressCircumference - (circularProgressCircumference * healthPercent) / 100;

  const mainColor = '#005A4A';
  const lightGreenBackground = '#E0F2F1';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Card Principal - Saúde Geral */}
        <View style={styles.healthCard}>
          <Text style={styles.healthCardTitle}>Sua saúde:</Text>
          <View style={styles.circularProgressContainer}>
            <Svg
              height={circularProgressRadius * 2 + circularProgressStrokeWidth}
              width={circularProgressRadius * 2 + circularProgressStrokeWidth}
            >
              <Circle
                stroke={lightGreenBackground}
                fill="transparent"
                cx={circularProgressRadius + circularProgressStrokeWidth / 2}
                cy={circularProgressRadius + circularProgressStrokeWidth / 2}
                r={circularProgressRadius}
                strokeWidth={circularProgressStrokeWidth}
              />
              <Circle
                stroke={mainColor}
                fill="transparent"
                cx={circularProgressRadius + circularProgressStrokeWidth / 2}
                cy={circularProgressRadius + circularProgressStrokeWidth / 2}
                r={circularProgressRadius}
                strokeWidth={circularProgressStrokeWidth}
                strokeDasharray={circularProgressCircumference}
                strokeDashoffset={circularProgressStrokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${circularProgressRadius + circularProgressStrokeWidth / 2} ${circularProgressRadius + circularProgressStrokeWidth / 2})`}
              />
            </Svg>
            <Text style={[styles.circularProgressText, { color: mainColor }]}>
              {healthPercent.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Barras de Progresso Individuais */}
        <ProgressBar label="ALIMENTAÇÃO:" value={nutritionScore} color={mainColor} />
        <ProgressBar label="TREINO:" value={trainingScore} color={mainColor} />

        {/* Botão de Otimizar */}
        <TouchableOpacity 
          style={styles.optimizeButton} 
          onPress={handleCalculateHealth} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#424242" />
          ) : (
            <Text style={styles.optimizeButtonText}>Otimizar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 32,
  },
  healthCardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressText: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  progressBarValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressBarBackground: {
    height: 28,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 20,
  },
  optimizeButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  optimizeButtonText: {
    color: '#424242',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SaudeScreen;