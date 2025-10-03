import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg'; // Re-importado para os ícones e gráfico
import { useSaudeViewModel } from '../viewmodels/SaudeViewModel'; // Certifique-se que o caminho está correto


const SaudeScreen: React.FC = () => {
  const {
    overallHealthPercentage,
    nutritionPercentage,
    trainingPercentage,
    onOptimizePress,
    isLoading,
  } = useSaudeViewModel();


  const circularProgressRadius = 80;
  const circularProgressStrokeWidth = 15;
  const circularProgressCircumference = 2 * Math.PI * circularProgressRadius;
  const circularProgressStrokeDashoffset =
    circularProgressCircumference - (circularProgressCircumference * overallHealthPercentage) / 100;

  const mainColor = '#00695C';
  const lightGreenBackground = '#E0F2F1';
  const inactiveTabColor = '#A0A0A0';
  const activeTabColor = '#00695C';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={mainColor} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
              {overallHealthPercentage}%
            </Text>
          </View>
        </View>

        {/* Barra de Progresso - Alimentação */}
        <View style={styles.progressItemContainer}>
          <Text style={styles.progressItemLabel}>ALIMENTAÇÃO:</Text>
          <View style={[styles.progressBarBackground, { backgroundColor: 'white', borderColor: mainColor, borderWidth: 2}]}>
            <View style={[styles.progressBarFill, { width: `${nutritionPercentage}%`, backgroundColor: mainColor }]}/>
            <Text style={[styles.progressItemPercentageText, {color: nutritionPercentage > 85 ? 'white' : mainColor, right: 15, fontWeight: 'bold'}]}>
              {nutritionPercentage}%
            </Text>
          </View>
        </View>

         <View style={styles.progressItemContainer}>
          <Text style={styles.progressItemLabel}>TREINO:</Text>
          <View style={[styles.progressBarBackground, { backgroundColor: 'white', borderColor: mainColor, borderWidth: 2}]}>
            <View style={[styles.progressBarFill, { width: `${trainingPercentage}%`, backgroundColor: mainColor }]}/>
            <Text style={[styles.progressItemPercentageText, {color: trainingPercentage > 85 ? 'white' : mainColor, right: 15, fontWeight: 'bold'}]}>
              {trainingPercentage}%
            </Text>
          </View>
        </View>

        {/* Botão Otimizar */}
        <TouchableOpacity style={styles.optimizeButton} onPress={onOptimizePress}>
          <Text style={styles.optimizeButtonText}>Otimizar</Text>
        </TouchableOpacity>
      </ScrollView>

     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  healthCardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularProgressText: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: '600',
  },
  progressItemContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  progressItemLabel: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  progressBarBackground: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 25,
  },
  progressItemPercentageText: {
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
  },
  optimizeButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optimizeButtonText: {
    color: '#424242',
    fontSize: 18,
    fontWeight: 'bold',
  },

});

export default SaudeScreen;