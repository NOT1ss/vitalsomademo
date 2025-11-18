import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabSelectorProps {
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

export default function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'login' && styles.activeTab]}
        onPress={() => onTabChange('login')}
        activeOpacity={0.8}
      >
        <Text 
          style={[
            styles.tabText, 
            activeTab === 'login' && styles.activeTabText
          ]}
        >
          Entrar
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
        onPress={() => onTabChange('signup')}
        activeOpacity={0.8}
      >
        <Text 
          style={[
            styles.tabText, 
            activeTab === 'signup' && styles.activeTabText
          ]}
        >
          Cadastrar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#005A4A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A1A1A1',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#005A4A',
  },
});