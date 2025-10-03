import { openBrowserAsync } from 'expo-web-browser';
import React from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';

type Props = {
  href: string;
  children: React.ReactNode;
  style?: any;
};

export function ExternalLink({ href, children, style }: Props) {
  const handlePress = async () => {
    if (Platform.OS === 'web') {
      // Na web, abre o link em uma nova aba
      window.open(href, '_blank');
    } else {
      // No mobile, abre o link no browser interno
      await openBrowserAsync(href);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
