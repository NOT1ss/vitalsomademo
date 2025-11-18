import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import supabase from '../supabaseClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

export function useWelcomeViewModel() {
  const navigation = useNavigation<NavigationProp>();

  const checkUserAsync = async (): Promise<'MainApp' | 'Login'> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? 'MainApp' : 'Login'; // Mude 'SaudeScreen' para 'Home'
  };

  return { checkUserAsync, navigation };
}
