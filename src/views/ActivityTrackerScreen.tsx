import { Ionicons } from '@expo/vector-icons';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Polyline, Region } from 'react-native-maps';
import { Activity } from '../models/activityModel';
import { RootStackParamList } from '../navigation/types';
import { startMockTracking } from '../services/mockLocationProvider';
import { addPoints, getUserProfile } from '../services/saudeService';
import supabase from '../supabaseClient';
import { useDesafiosViewModel } from '../viewmodels/useDesafiosViewModel';

// Flag para ativar/desativar o modo de simulação
const IS_SIMULATION = false; // Mude para false para usar o GPS real

// Haversine formula to calculate distance between two lat/lon points
const haversine = require('haversine');

type LatLng = {
  latitude: number;
  longitude: number;
};

type ActivityTrackerRouteProp = RouteProp<RootStackParamList, 'ActivityTracker'>;

export default function ActivityTrackerScreen() {
  const navigation = useNavigation();
  const route = useRoute<ActivityTrackerRouteProp>();
  const { tipo_atividade } = route.params;

  const { desafioAtivo, completarDesafio } = useDesafiosViewModel();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Tracking State
  const [trackingState, setTrackingState] = useState<
    'idle' | 'tracking' | 'paused'
  >('idle');
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [distance, setDistance] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscriptionRef = useRef<{ remove(): void } | null>(null);

  // Format time from seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };

  // Calculate pace in min/km
  const calculatePace = () => {
    // Only calculate pace after a meaningful distance and time
    if (distance < 0.02 || timer < 5) return '--:--';

    const speedKmh = (distance / timer) * 3600; // Calculate speed in km/h
    if (speedKmh < 1.5) return '--:--'; // Se a velocidade for muito baixa, não mostra pace

    const pace = timer / 60 / distance; // min/km
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Calculate speed in km/h
  const calculateSpeed = () => {
    if (distance < 0.02 || timer < 5) return '--.--';

    const speed = (distance / timer) * 3600; // km/h
    if (speed < 1.5) return '--.--'; // Se a velocidade for muito baixa, não mostra velocidade

    return speed.toFixed(1);
  };

  // Start the timer
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
  };

  // Stop the timer
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Start tracking location
  const startLocationTracking = async () => {
    if (IS_SIMULATION) {
      locationSubscriptionRef.current = startMockTracking((newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setRouteCoordinates((prevRoute) => {
          const newPoint = { latitude, longitude };
          if (prevRoute.length > 0) {
            const lastPoint = prevRoute[prevRoute.length - 1];
            setDistance(
              (prevDistance) => prevDistance + haversine(lastPoint, newPoint)
            );
          }
          return [...prevRoute, newPoint];
        });
        // Na simulação, a precisão é sempre boa
        setGpsAccuracy(5);
      });
    } else {
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const { latitude, longitude, accuracy } = newLocation.coords;
          setRouteCoordinates((prevRoute) => {
            const newPoint = { latitude, longitude };
            if (prevRoute.length > 0) {
              const lastPoint = prevRoute[prevRoute.length - 1];
              setDistance(
                (prevDistance) => prevDistance + haversine(lastPoint, newPoint)
              );
            }
            return [...prevRoute, newPoint];
          });
          setGpsAccuracy(accuracy);
        }
      );
    }
  };

  // Stop tracking location
  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  };

  // Handlers for controls
  const handleStart = () => {
    console.log('[handleStart] Iniciando rastreamento...');
    setTrackingState('tracking');
    startTimer();
    startLocationTracking();
  };

  const handlePause = () => {
    console.log('[handlePause] Pausando rastreamento...');
    setTrackingState('paused');
    stopTimer();
    stopLocationTracking();
  };

  const handleResume = () => {
    console.log('[handleResume] Retomando rastreamento...');
    setTrackingState('tracking');
    startTimer();
    startLocationTracking();
  };

  const handleSave = async () => {
    stopTimer();
    stopLocationTracking();

    if (timer < 60) { // Minimum 1 minute duration
      Alert.alert(
        'Atividade muito curta',
        'A atividade precisa ter pelo menos 1 minuto de duração para ser salva.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    Alert.alert(
      'Salvar Atividade?',
      'Deseja salvar esta atividade ou descartá-la?',
      [
        {
          text: 'Descartar',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: async () => {
            setIsSaving(true);
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) {
                Alert.alert('Erro', 'Você precisa estar logado para salvar a atividade.');
                return;
              }

              const userProfile = await getUserProfile();
              if (!userProfile) {
                Alert.alert('Erro', 'Não foi possível carregar o perfil do usuário.');
                return;
              }

              const newActivity: Activity = {
                user_id: user.id,
                tipo_atividade: tipo_atividade,
                distancia_km: parseFloat(distance.toFixed(2)),
                duracao_segundos: timer,
                ritmo_min_km: tipo_atividade === 'ciclismo' ? calculateSpeed() : calculatePace(),
                rota: routeCoordinates,
              };

              const { error } = await supabase.from('atividades').insert(newActivity);

              if (error) {
                Alert.alert('Erro ao Salvar', 'Não foi possível salvar sua atividade. Tente novamente.');
                console.error('Error saving activity:', error);
              } else {
                // Adiciona 5 pontos por salvar qualquer atividade
                try {
                  await addPoints(userProfile.id, 5);
                } catch (e) {
                  console.error('Error adding points:', e);
                }

                // --- Lógica de Desafios ---
                if (desafioAtivo && userProfile.id === desafioAtivo.usuario_id && newActivity.tipo_atividade === desafioAtivo.desafio.tipo) {
                  // Atualizar progresso do desafio ativo no banco de dados
                  const newProgressKm = desafioAtivo.progresso_km + newActivity.distancia_km;
                  const { error: updateChallengeError } = await supabase
                    .from('desafios_usuarios')
                    .update({ progresso_km: newProgressKm })
                    .eq('id', desafioAtivo.id);

                  if (updateChallengeError) {
                    console.error('Erro ao atualizar progresso do desafio:', updateChallengeError);
                  } else {
                    // Verificar se o desafio foi concluído
                    if (newProgressKm >= desafioAtivo.desafio.meta_km) {
                      await completarDesafio({ ...desafioAtivo, progresso_km: newProgressKm });
                    }
                  }
                }
                // --- Fim Lógica de Desafios ---

                Alert.alert('Atividade Salva!', 'Sua atividade foi salva com sucesso.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              }
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    (async () => {
      if (IS_SIMULATION) {
        // Na simulação, definimos uma região inicial baseada na primeira coordenada da rota mock
        setInitialRegion({
          latitude: -23.5869, // Primeira coordenada da mockRoute
          longitude: -46.6608,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setGpsAccuracy(5); // Precisão boa na simulação
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(
          'Permissão para acessar a localização foi negada. Por favor, habilite nas configurações.'
        );
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setInitialRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setGpsAccuracy(currentLocation.coords.accuracy);
      } catch (error) {
        setErrorMsg('Não foi possível obter a localização. Tente novamente.');
        console.error('Error getting initial location:', error);
      }
    })();

    // Cleanup on unmount
    return () => {
      stopTimer();
      stopLocationTracking();
    };
  }, []);

  const getActivityTitle = (type: Activity['tipo_atividade']) => {
    switch (type) {
      case 'corrida':
        return 'Nova Corrida';
      case 'caminhada':
        return 'Nova Caminhada';
      case 'ciclismo':
        return 'Novo Ciclismo';
      default:
        return 'Nova Atividade';
    }
  };

  const renderContent = () => {
    if (errorMsg) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      );
    }

    if (!initialRegion) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Obtendo sua localização...</Text>
        </View>
      );
    }

    return (
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation>
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#007bff"
          strokeWidth={5}
        />
      </MapView>
    );
  };

  const renderControls = () => {
    if (trackingState === 'idle') {
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.startButton]}
          onPress={handleStart}
          disabled={!initialRegion}>
          <Text style={styles.controlButtonText}>START</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.trackingControls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            trackingState === 'paused'
              ? styles.resumeButton
              : styles.pauseButton,
          ]}
          onPress={trackingState === 'paused' ? handleResume : handlePause}>
          <Ionicons
            name={trackingState === 'paused' ? 'play' : 'pause'}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.controlButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getActivityTitle(tipo_atividade)}</Text>
          {gpsAccuracy !== null && gpsAccuracy > 10 && (
            <View style={styles.gpsWarningContainer}>
              <Ionicons
                name="warning"
                size={28}
                color="red"
                style={styles.gpsWarningIcon}
              />
              <Text style={styles.gpsWarningText}>GPS Fraco</Text>
            </View>
          )}
        </View>

        {/* Conteúdo Principal */}
        <View style={styles.contentContainer}>{renderContent()}</View>

        {/* Métricas e Controles */}
        <View style={styles.bottomContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Distância (km)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {tipo_atividade === 'ciclismo' ? calculateSpeed() : calculatePace()}
              </Text>
              <Text style={styles.statLabel}>
                {tipo_atividade === 'ciclismo' ? 'Velocidade (km/h)' : 'Pace (min/km)'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatTime(timer)}</Text>
              <Text style={styles.statLabel}>Tempo</Text>
            </View>
          </View>
          <View style={styles.controlsContainer}>{renderControls()}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    top: 40,
    left: 15,
    right: 15,
    zIndex: 10,
    borderRadius: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  gpsWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  gpsWarningIcon: {
    marginRight: 5,
  },
  gpsWarningText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 15,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    height: 70,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#28a745',
    width: 150,
  },
  trackingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  pauseButton: {
    backgroundColor: '#ffc107',
    width: 70,
  },
  resumeButton: {
    backgroundColor: '#28a745',
    width: 70,
  },
  saveButton: {
    backgroundColor: '#007bff',
    width: 120,
  },
});