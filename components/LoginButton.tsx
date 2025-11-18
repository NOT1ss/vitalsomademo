import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface LoginButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  primary?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export default function LoginButton({
  title,
  onPress,
  loading = false,
  primary = true,
  icon,
  style
}: LoginButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        style
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={primary ? '#FFFFFF' : '#00A572'} />
      ) : (
        <>
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color={primary ? '#FFFFFF' : '#333333'} 
              style={styles.icon} 
            />
          )}
          <Text style={[styles.buttonText, primary ? styles.primaryText : styles.secondaryText]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#00A572',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#333333',
  },
  icon: {
    marginRight: 8,
  },
});