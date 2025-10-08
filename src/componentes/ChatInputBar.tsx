// src/componentes/ChatInputBar.tsx
import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform // Necessário para ajustar o padding do TextInput
} from 'react-native';

// Cores primárias (As mesmas usadas na tela principal)
const PRIMARY_GREEN = "#2E7D32"; 
const LIGHT_GRAY = "#F1F1F1";
const WHITE = "#FFFFFF";
const BORDER_GRAY = "#E0E0E0";

type ChatInputBarProps = {
  handleSend: () => void;
  input: string;
  setInput: (text: string) => void;
  isLoading: boolean;
};

export const ChatInputBar = ({ handleSend, input, setInput, isLoading }: ChatInputBarProps) => {
  
  // Condição para desabilitar o botão: Está carregando OU o input está vazio/só com espaços
  const isDisabled = isLoading || !input.trim();
  
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        // Correção de sensibilidade: Garantimos que o placeholder é sempre uma string
        placeholder={isLoading ? "Aguarde, Hiro está digitando..." : "Digite sua mensagem..."}
        value={input}
        onChangeText={setInput}
        placeholderTextColor="#888"
        editable={!isLoading}
        multiline
        // Ajuste para rolar a tela automaticamente se o input crescer (Android)
        scrollEnabled={true} 
      />
      
      <TouchableOpacity
        style={[
          styles.sendButton, 
          isDisabled && styles.sendButtonDisabled, // Aplica estilo de desabilitado
        ]}
        onPress={handleSend}
        disabled={isDisabled}
      >
        {/* O ícone de envio (garantido dentro de <Text>) */}
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', // Alinha ao fundo para inputs multilinhas
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: WHITE, 
    borderTopWidth: 1, 
    borderTopColor: BORDER_GRAY 
  },
  input: { 
    flex: 1, 
    backgroundColor: LIGHT_GRAY, 
    borderRadius: 22, 
    paddingHorizontal: 16, 
    
    // Ajuste de padding vertical para melhor visualização em Android/iOS
    paddingTop: Platform.OS === 'ios' ? 10 : 8, 
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 44, // Garante altura mínima
    maxHeight: 100, // Limite o crescimento para não ocupar a tela toda
    
    fontSize: 15, 
    color: "#000", 
    marginRight: 10,
  },
  sendButton: { 
    marginLeft: 10, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: PRIMARY_GREEN, // Corrigido para o verde principal
    justifyContent: "center", 
    alignItems: "center",
    marginBottom: Platform.OS === 'ios' ? 0 : 2, // Pequeno ajuste para alinhar com o input
  },
  sendButtonDisabled: { 
    backgroundColor: '#B0B0B0', // Cinza claro quando desabilitado
  },
  sendText: { 
    color: WHITE, 
    fontSize: 18, 
    fontWeight: "bold",
    // Pequeno ajuste para centralizar o ícone de seta
    transform: [{ translateX: 1 }, { translateY: -1 }] 
  },
});