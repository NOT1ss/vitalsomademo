import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Activity } from '../models/activityModel';
import { RootStackParamList } from '../navigation/types';
import supabase from '../supabaseClient';

type ActivityDetailRouteProp = RouteProp<RootStackParamList, 'ActivityDetail'>;

export default function ActivityDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ActivityDetailRouteProp>();
  const { activityId } = route.params;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('atividades')
        .select('*')
        .eq('id', activityId)
        .single();

      if (dbError || !data) {
        setError('Não foi possível carregar os detalhes da atividade.');
        console.error('Error fetching activity details:', dbError);
      } else {
        setActivity(data as Activity);
      }
      setLoading(false);
    };

    fetchActivityDetails();
  }, [activityId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };

  const getActivityTitle = (type: Activity['tipo_atividade']) => {
    switch (type) {
      case 'corrida':
        return 'Detalhes da Corrida';
      case 'caminhada':
        return 'Detalhes da Caminhada';
      case 'ciclismo':
        return 'Detalhes do Ciclismo';
      default:
        return 'Detalhes da Atividade';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      );
    }

    if (error || !activity) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: activity.rota[0].latitude,
              longitude: activity.rota[0].longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}>
            <Polyline
              coordinates={activity.rota}
              strokeColor="#007bff"
              strokeWidth={5}
            />
          </MapView>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{getActivityTitle(activity.tipo_atividade)}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activity.distancia_km.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Distância (km)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatTime(activity.duracao_segundos)}</Text>
              <Text style={styles.statLabel}>Duração</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activity.ritmo_min_km}</Text>
              <Text style={styles.statLabel}>
                {activity.tipo_atividade === 'ciclismo' ? 'Velocidade (km/h)' : 'Pace (min/km)'}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{new Date(activity.created_at).toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.statLabel}>Data</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getActivityTitle(activity?.tipo_atividade || 'Atividade')}</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
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
    marginRight: 30, // Adjust for back button
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  mapContainer: {
    height: 300,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});