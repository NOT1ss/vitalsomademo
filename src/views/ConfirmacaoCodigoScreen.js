import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useConfirmacaoCodigoViewModel from '../viewmodels/ConfirmacaoCodigoViewModel';
import useEsqueciSenhaViewModel from '../viewmodels/EsqueciSenhaViewModel';
export default function ConfirmacaoCodigoScreen() {
  const {
    codigo,
    setCodigo,
    handleConfirmar,
  } = useConfirmacaoCodigoViewModel(); useEsqueciSenhaViewModel();

  const {
    handleBackToLogin,
  } = useEsqueciSenhaViewModel();

  return (
    <LinearGradient
      colors={['#e9ffda', '#FFFFFF']}
      style={styles.container}
    >
      <Image
        source={require('../../assets/images/imagejoia.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Enviamos um código</Text>
      <Text style={styles.subtitle}>
        Acabamos de enviar um código para o e-mail descrito. Confira sua caixa de mensagem.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Insira o código"
          placeholderTextColor="#A1A1A1"
          keyboardType="number-pad"
          value={codigo}
          onChangeText={setCodigo}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
              <Text style={styles.footerText}>Consegue lembrar da senha?</Text>
              <Pressable onPress={handleBackToLogin}>
                <Text style={styles.linkText}> Voltar</Text>
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
    linkText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
  },
  footerText: {
    color: '#555',
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
