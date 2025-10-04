import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useWelcomeViewModel } from '../viewmodels/useWelcomeViewModel';

export default function WelcomeView() {
  const { checkUserAsync, navigation } = useWelcomeViewModel();

  useEffect(() => {
    const navigate = async () => {
      const screen = await checkUserAsync();
      navigation.navigate(screen);
    };

    // Apenas para garantir que a tela de loading seja vista brevemente
    setTimeout(navigate, 1500); 
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/2.png')} // Usando a logo colorida
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#00695C" style={styles.spinner} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '60%', // Largura responsiva
    aspectRatio: 1, // Mantém a proporção
    marginBottom: 40,
  },
  spinner: {
    transform: [{ scale: 1.5 }], // Deixa o spinner um pouco maior
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});