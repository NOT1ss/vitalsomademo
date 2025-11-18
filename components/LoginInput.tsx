import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface LoginInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  iconName: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  disableAutofill?: boolean; 
}

export default function LoginInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  iconName,
  disableAutofill = false,
  rightIcon,
  onRightIconPress
}: LoginInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={iconName} size={20} color="#00A572" style={styles.leftIcon} />
      
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(161, 161, 161, 0.5)"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        // Desabilita Strong Password e autofill no iOS
  textContentType={secureTextEntry ? "oneTimeCode" : "none"} // "oneTimeCode" evita sugestões de senha
  // Desabilita autofill no Android
  autoComplete={Platform.OS === 'android' ? 'off' : undefined}
  importantForAutofill={Platform.OS === 'android' ? 'no' : undefined}
      />
      
      {rightIcon && onRightIconPress && (
        <Pressable onPress={onRightIconPress} hitSlop={8}>
          <Ionicons
            name={rightIcon}
            size={20}
            color="#00A572"
            style={styles.rightIcon}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    height: 48,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    color: '#333333',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});