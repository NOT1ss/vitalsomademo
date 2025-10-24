import { Ionicons } from '@expo/vector-icons';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Activity } from '../models/activityModel';
import { RootStackParamList } from '../navigation/types';
import supabase from '../supabaseClient';

type ActivityListRouteProp = RouteProp<RootStackParamList, 'ActivityList'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'ActivityList'>;

interface ActivityCardProps {
  item: Activity;
  onPress: () => void;
  onDelete: (id: number) => void;
}

const ActivityCard = ({ item, onPress, onDelete }: ActivityCardProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };

  const getActivityName = (type: Activity['tipo_atividade']) => {
    switch (type) {
      case 'corrida':
        return 'Corrida';
      case 'caminhada':
        return 'Caminhada';
      case 'ciclismo':
        return 'Ciclismo';
      default:
        return 'Atividade';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {getActivityName(item.tipo_atividade)} de {item.distancia_km.toFixed(2)} km
        </Text>
        <TouchableOpacity
          onPress={() => onDelete(item.id as number)}
          style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(item.duracao_segundos)}</Text>
          <Text style={styles.statLabel}>Duração</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.ritmo_min_km}</Text>
          <Text style={styles.statLabel}>Pace (min/km)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ActivityListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ActivityListRouteProp>();
  const { tipo_atividade } = route.params;
  const isFocused = useIsFocused();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getActivityTitle = (type: Activity['tipo_atividade']) => {
    switch (type) {
      case 'corrida':
        return 'Minhas Corridas';
      case 'caminhada':
        return 'Minhas Caminhadas';
      case 'ciclismo':
        return 'Meus Ciclismos';
      default:
        return 'Minhas Atividades';
    }
  };

  const EmptyActivityMessage = (type: Activity['tipo_atividade']) => {
    switch (type) {
      case 'corrida':
        return 'Nenhuma corrida registrada';
      case 'caminhada':
        return 'Nenhuma caminhada registrada';
      case 'ciclismo':
        return 'Nenhum ciclismo registrado';
      default:
        return 'Nenhuma atividade registrada';
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Você precisa estar logado para ver suas atividades.');
      setLoading(false);
      return;
    }

    const { data, error: dbError } = await supabase
      .from('atividades') // Alterado para a nova tabela
      .select('*')
      .eq('user_id', user.id)
      .eq('tipo_atividade', tipo_atividade) // Filtrar por tipo
      .order('created_at', { ascending: false });

    if (dbError) {
      setError('Não foi possível carregar o histórico de atividades.');
      console.error('Error fetching activities:', dbError);
    } else {
      setActivities(data as Activity[]);
    }
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta atividade?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            const { error: dbError } = await supabase
              .from('atividades') // Alterado para a nova tabela
              .delete()
              .eq('id', id);

            if (dbError) {
              Alert.alert('Erro', 'Não foi possível excluir a atividade.');
              console.error('Error deleting activity:', dbError);
            } else {
              setActivities((prevActivities) =>
                prevActivities.filter((activity) => activity.id !== id)
              );
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    if (isFocused) {
      fetchActivities();
    }
  }, [isFocused, tipo_atividade]); // Adicionar tipo_atividade como dependência

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (activities.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="walk" size={60} color="#cccccc" />
          <Text style={styles.emptyText}>{EmptyActivityMessage(tipo_atividade)}</Text>
          <Text style={styles.emptySubText}>
            Pressione o botão '+' para iniciar uma nova atividade.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={activities}
        renderItem={({ item }) => (
          <ActivityCard
            item={item}
            onPress={() =>
              navigation.navigate('ActivityDetail', { activityId: item.id as number })
            }
            onDelete={handleDelete}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
          <TouchableOpacity
            onPress={() => navigation.navigate('ActivityTracker', { tipo_atividade })}
            style={styles.addButton}>
            <Ionicons name="add" size={32} color="#007bff" />
          </TouchableOpacity>
        </View>
        {renderContent()}
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
    justifyContent: 'space-between',
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
  },
  addButton: {
    padding: 5,
  },
  listContainer: {
    padding: 10,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50, // Adjust to center better
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardContent: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
});