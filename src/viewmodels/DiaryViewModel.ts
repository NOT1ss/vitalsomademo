import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type DiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainApp'>;

// A interface 'Meal' agora é EXPORTADA
export interface Meal {
  id: number;
  name: string;
  description: string;
  time: string;
  image?: ImageSourcePropType;
}

const useDiaryViewModel = () => {
  const navigation = useNavigation<DiaryScreenNavigationProp>();

  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: 'Café da Manhã', description: 'Macarronada bolada com o melhor molho branco que você já viu na vida', time: '8:00', image: require('../../assets/images/cafemanha.jpg'), },
    { id: 2, name: 'Almoço', description: 'Barrinha de proteína da growth com um copo de água sem gás', time: '12:00', image: require('../../assets/images/almoco.jpeg'), },
    { id: 3, name: 'Janta', description: 'Pão e água', time: '23:00', image: require('../../assets/images/janta.jpg'), },
  ]);

  const [healthTips] = useState([
    'A quantidade de água que um adulto deve beber por dia é de cerca de 2 a 3 litros. Mantenha-se hidratado!',
    'Uma boa noite de sono, de 7 a 9 horas, é crucial para a recuperação muscular e para a saúde mental.',
    'Inclua vegetais em todas as refeições. Eles são ricos em vitaminas, minerais e fibras.',
    'Evite alimentos processados e ricos em açúcar. Eles podem causar picos de insulina e inflamação.',
    'Praticar 30 minutos de atividade física moderada na maioria dos dias da semana traz grandes benefícios para a saúde.',
  ]);

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % healthTips.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [healthTips.length]);

  const handleOpenMealDetails = (meal: Meal) => { console.log('Abrindo detalhes de:', meal.name); };
  const handleOpenWorkoutList = () => { console.log('Abrindo a lista de treinos'); };
  const handleOpenWeekPlanning = () => { console.log('Abrindo o planejamento da semana'); };
  const handleNavigateToAlimentacao = () => { navigation.navigate('Receitas'); };
  const handleNavigateToTreino = () => { navigation.navigate('Treino'); };

  return {
    meals,
    healthTips,
    currentTipIndex,
    handleOpenMealDetails,
    handleOpenWorkoutList,
    handleOpenWeekPlanning,
    handleNavigateToAlimentacao,
    handleNavigateToTreino,
  };
};

export default useDiaryViewModel;