import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { useSaudeViewModel } from '../viewmodels/SaudeViewModel';
import { Ionicons } from '@expo/vector-icons';

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

// NOVO: Componente para o Card de Status
const StatusCard = ({ trainingScore, nutritionScore, remainingKcal }: { trainingScore: number, nutritionScore: number, remainingKcal: number }) => {
  const navigation = useNavigation();
  const isTrainingDone = trainingScore === 100;
  const caloriesExceeded = remainingKcal < 0;

  return (
    <View style={styles.statusCard}>
      <Text style={styles.cardTitle}>Status do Dia</Text>
      
      <View style={styles.statusItem}>
        <Ionicons name={isTrainingDone ? "checkmark-circle" : "alert-circle-outline"} size={24} color={isTrainingDone ? "#22c55e" : "#f97316"} />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{isTrainingDone ? "Treino de hoje concluído!" : "Treino de hoje pendente."}</Text>
          {!isTrainingDone && (
            <TouchableOpacity onPress={() => navigation.navigate('SemanaTreino' as never)}>
              <Text style={styles.statusActionText}>Registrar treino</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statusItem}>
        <Ionicons name={caloriesExceeded ? "warning-outline" : "fast-food-outline"} size={24} color={caloriesExceeded ? "#ef4444" : "#3b82f6"} />
        <View style={styles.statusTextContainer}>
          {caloriesExceeded ? (
            <Text style={styles.statusText}>Você ultrapassou sua meta em <Text style={{fontWeight: 'bold'}}>{Math.abs(remainingKcal)}</Text> calorias!</Text>
          ) : (
            <>
              <Text style={styles.statusText}>Sua meta de calorias está em {nutritionScore.toFixed(0)}%.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Receitas', { initialTab: 'alimentos' })}>
                <Text style={styles.statusActionText}>Adicionar alimento</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    remainingKcal,
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
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.healthCard}>
          <Text style={styles.cardTitle}>Saúde Geral</Text>
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

        <View style={styles.progressBarsCard}>
            <ProgressBar label="ALIMENTAÇÃO:" value={nutritionScore} color={mainColor} />
            <ProgressBar label="TREINO:" value={trainingScore} color={mainColor} />
        </View>

        <TouchableOpacity 
          style={styles.optimizeButton} 
          onPress={handleCalculateHealth} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#424242" />
          ) : (
            <Text style={styles.optimizeButtonText}>Atualizar Status</Text>
          )}
        </TouchableOpacity>

        <StatusCard trainingScore={trainingScore} nutritionScore={nutritionScore} remainingKcal={remainingKcal} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 24,
    marginTop: 24, // Adiciona espaço acima
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  statusActionText: {
    fontSize: 14,
    color: '#005A4A',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 4,
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
  progressBarsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 24,
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
    backgroundColor: '#F5F5F5',
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
    marginTop: 8,
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