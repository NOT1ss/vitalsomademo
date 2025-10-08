import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { AchievementCardProps } from '../componentes/AchievementCard';
import { DiaSemana, ExercicioCompleto, gerarSemanaAtual } from '../models/semanaTreinoModel';
import { calculateTrainingStreak, getPersonalRecords, getTrainingsForDateRange, getUserProfile, updateDailySummary } from '../services/saudeService';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SemanaTreino'>;

interface ActiveAchievements {
  record: AchievementCardProps | null;
  streak: AchievementCardProps | null;
}

// Função auxiliar para converter a data para o formato YYYY-MM-DD local, evitando problemas de fuso horário
const toDateString = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função auxiliar para extrair os dados de progresso da string
const parseProgresso = (progresso: string): { series: string; repeticoes: string; carga: string } => {
  const seriesMatch = progresso.match(/Séries: ([\w-]+)/);
  const repeticoesMatch = progresso.match(/Repetições: ([\w-]+)/);
  const cargaMatch = progresso.match(/Carga: ([\w-]+)/);
  return {
    series: seriesMatch ? seriesMatch[1] : '',
    repeticoes: repeticoesMatch ? repeticoesMatch[1] : '',
    carga: cargaMatch ? cargaMatch[1] : '',
  };
};


export function useSemanaTreinoViewModel() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'SemanaTreino'>>();
  
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<ActiveAchievements>({ record: null, streak: null });
  const [personalRecords, setPersonalRecords] = useState<[string, string][]>([]); // Estado para os recordes
  const [currentStreak, setCurrentStreak] = useState(0);
  const prevRecordsRef = useRef<[string, string][]>();
  const prevStreakRef = useRef(0);
  const hoje = new Date();

  const handleDismissAchievement = (type: 'record' | 'streak') => {
    setAchievements(prev => ({ ...prev, [type]: null }));
  };

  const fetchWeekData = useCallback(async () => {
    try {
      setIsLoading(true);
      const semanaBase = gerarSemanaAtual(new Date()); 
      const inicioSemana = toDateString(semanaBase[0].data);
      const fimSemana = toDateString(semanaBase[6].data);

      // Busca treinos, recordes e sequência em paralelo
      const [treinosSalvos, recordsMap, streak] = await Promise.all([
        getTrainingsForDateRange(inicioSemana, fimSemana),
        getPersonalRecords(),
        calculateTrainingStreak(),
      ]);

      setPersonalRecords(Array.from(recordsMap.entries()));
      setCurrentStreak(streak);

      const semanaComDados = semanaBase.map(dia => {
        const dataDiaString = toDateString(dia.data);
        const exerciciosDoDia = treinosSalvos
          .filter(treino => treino.data_registro === dataDiaString)
          .map((treino, index): ExercicioCompleto => {
            const progresso = parseProgresso(treino.progresso || '');
            return {
              id: `${dataDiaString}-${index}`,
              db_id: treino.id, // Mapeia o ID do banco para o nosso modelo
              nome: treino.atividade,
              series: progresso.series,
              repeticoes: progresso.repeticoes,
              carga: progresso.carga,
              imagem: require('../../assets/images/image 40.png'), // Imagem placeholder
            };
          });

        // Define o status do dia
        let status: DiaSemana['status'] = 'pendente';
        if (exerciciosDoDia.length > 0) {
          status = 'concluido';
        } else if (dia.data < hoje) {
          status = 'nao_realizado';
        }

        return { ...dia, exercicios: exerciciosDoDia, status };
      });

      setDias(semanaComDados);
      
      const diaDeHoje = semanaComDados.find(d => toDateString(d.data) === toDateString(hoje)) || semanaComDados[0];
      setDiaSelecionado(diaDeHoje);

    } catch (error) {
      console.error("Erro ao carregar dados da semana:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da semana.");
    }
    finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carrega os dados quando a tela é focada
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWeekData();
    });
    return unsubscribe;
  }, [navigation, fetchWeekData]);

  // Compara recordes antigos e novos para disparar o popup
  useEffect(() => {
    const prevRecords = prevRecordsRef.current;
    if (prevRecords) {
      const prevMap = new Map(prevRecords);
      const newMap = new Map(personalRecords);

      newMap.forEach((valorNovo, exercicio) => {
        const valorAntigo = prevMap.get(exercicio);
        const numNovo = parseFloat(valorNovo.replace(/[^0-9.,]/g, '').replace(',', '.'));

        if (!valorAntigo || numNovo > parseFloat(valorAntigo.replace(/[^0-9.,]/g, '').replace(',', '.'))) {
          const newAchievement: AchievementCardProps = {
            id: `record-${Date.now()}`,
            icon: 'trophy',
            iconColor: '#facc15', // yellow-400
            title: 'Parabéns',
            message: 'Você bateu um record!',
            highlight: `${exercicio}`,
            onDismiss: () => handleDismissAchievement('record'),
          };
          setAchievements(prev => ({ ...prev, record: newAchievement }));
        }
      });
    }
    prevRecordsRef.current = personalRecords;
  }, [personalRecords]);

  // Dispara o popup de ofensiva
  useEffect(() => {
    const prevStreak = prevStreakRef.current;
    const milestones = [3, 7, 14, 30, 50, 100];

    if (currentStreak > prevStreak && milestones.includes(currentStreak)) {
        const newAchievement: AchievementCardProps = {
            id: `streak-${Date.now()}`,
            icon: 'flame',
            iconColor: '#f97316', // orange-500
            title: 'Ofensiva',
            message: 'Você está em uma sequência de dias treinados.',
            highlight: `${currentStreak} Dias`,
            onDismiss: () => handleDismissAchievement('streak'),
        };
        setAchievements(prev => ({ ...prev, streak: newAchievement }));
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  // Restante das funções...
  const handleSelecionarDia = (dia: DiaSemana) => {
    setDiaSelecionado(dia);
  };

  const handleMarcarConcluido = async () => {
    if (!diaSelecionado) return;
    
    if (diaSelecionado.exercicios.length === 0) {
      Alert.alert("Atenção", "Adicione exercícios clicando em 'Treinar' para marcar o dia como concluído.");
      return;
    }

    try {
      const profile = await getUserProfile();
      if (!profile) throw new Error("Perfil não encontrado");
      const dateString = toDateString(diaSelecionado.data);
      await updateDailySummary(profile.id, { training_completed: true }, dateString);
      
      const diaAtualizado = { ...diaSelecionado, status: 'concluido' as const };
      const novosDias = dias.map(d => d.id === diaAtualizado.id ? diaAtualizado : d);
      setDias(novosDias);
      setDiaSelecionado(diaAtualizado);

      Alert.alert("Sucesso!", "Treino marcado como concluído.");

    } catch (error) {
      Alert.alert("Erro", "Não foi possível marcar o treino como concluído.");
    }
  };
  
  const handleTreinar = () => {
    if (diaSelecionado) {
      navigation.navigate('RegistrarTreino', { dia: diaSelecionado });
    }
  };

  const handleVerTreino = () => {
    if (diaSelecionado && diaSelecionado.exercicios.length > 0) {
      navigation.navigate('TreinoCompleto', { dia: diaSelecionado });
    } else {
      Alert.alert("Nenhum treino", "Nenhum treino registrado para este dia.");
    }
  };
  
  const handleVerMaisCalendario = () => {
    navigation.navigate('CalendarioCompleto', { dias });
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  return { dias, diaSelecionado, isLoading, achievements, personalRecords, handleMarcarConcluido, handleSelecionarDia, handleGoBack, handleVerTreino, handleTreinar, handleVerMaisCalendario, handleDismissAchievement };
}