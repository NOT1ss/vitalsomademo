import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function SucessoSenhaScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#FDFAF5', '#FFFFFF']}
      style={styles.container}
    >
      <Image
        source={require('../../assets/images/image 49.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Parabéns, sua senha foi alterada!</Text>

      <Text style={styles.subtitle}>
        Clique no botão abaixo e volte para refazer seu login. Não esqueça de nos avaliar!
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 180,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 50,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
