import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useEsqueciSenhaViewModel from '../viewmodels/EsqueciSenhaViewModel';

export default function EsqueciSenhaScreen() {
  const {
    email,
    setEmail,
    handleSend,
    handleBackToLogin,
  } = useEsqueciSenhaViewModel();

  return (
    <LinearGradient
      colors={['#E9FCE9', '#FFFFFF']}
      style={styles.container}
    >
      <Image
        source={require('../../assets/images/image 41.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Esqueceu a senha?</Text>
      <Text style={styles.subtitle}>
        Não se preocupe! Acontece. Por favor, insira{'\n'}o e-mail associado à sua conta.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Insira Seu Email"
          placeholderTextColor="#A1A1A1"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Enviar Código</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Consegue lembrar da senha?</Text>
        <Pressable onPress={handleBackToLogin}>
          <Text style={styles.linkText}> Entrar</Text>
        </Pressable>
      </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
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
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
  },
  footerText: {
    color: '#555',
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
