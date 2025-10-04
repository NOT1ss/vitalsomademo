import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useNovaSenhaViewModel from '../viewmodels/NovaSenhaViewModel';

export default function NovaSenhaScreen() {
  const {
    senha,
    confirmarSenha,
    setSenha,
    setConfirmarSenha,
    handleConfirmar,
  } = useNovaSenhaViewModel();

  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#ebf8cf', '#FFFFFF']}
      style={styles.container}
    >
      <Image
        source={require('../../assets/images/ideianova.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Refaça a senha</Text>
      <Text style={styles.subtitle}>Por favor, digite algo que você irá lembrar!</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry
          style={styles.input}
          placeholder="Insira a senha"
          placeholderTextColor="#A1A1A1"
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry
          style={styles.input}
          placeholder="Confirme a senha"
          placeholderTextColor="#A1A1A1"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Consegue lembrar da senha?{' '}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('Login')}
        >
          Entrar
        </Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 145,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 50,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 25,
    fontSize: 14,
    color: '#444',
  },
  linkText: {
    color: '#007BFF',
    fontWeight: '600',
  },
});
