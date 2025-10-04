import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

type ChatInputBarProps = {
  handleSend: () => void; // Alterado de onSend para handleSend para consistência
  input: string;
  setInput: (text: string) => void;
  isLoading: boolean;
};

export const ChatInputBar = ({ handleSend, input, setInput, isLoading }: ChatInputBarProps) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={isLoading ? "Aguarde..." : "Digite sua mensagem..."}
        value={input}
        onChangeText={setInput}
        placeholderTextColor="#888"
        editable={!isLoading}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!input.trim() || isLoading}
      >
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
    input: { flex: 1, backgroundColor: "#F1F1F1", borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: "#000", maxHeight: 100 },
    sendButton: { marginLeft: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: "#2E86AB", justifyContent: "center", alignItems: "center" },
    sendButtonDisabled: { backgroundColor: '#B0C4DE' },
    sendText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});