// src/views/EuScreen.tsx

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptimizedImage from '../componentes/OptimizedImage';
import { usePerfilViewModel } from '../viewmodels/usePerfilViewModel';

// CORREÇÃO 3: Adiciona a tipagem para as props do InfoBox
const InfoBox = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoBoxLabel}>{label}</Text>
    <Text style={styles.infoBoxValue}>{value || 'N/A'}</Text>
  </View>
);

const EuScreen: React.FC = () => {
  const { userData, loading, handleLogout } = usePerfilViewModel();

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <OptimizedImage
            source={require('../../assets/images/eu.png')}
            style={styles.profileImage}
          />
          {/* Opcional Chaining (?.) e o fallback (||) já lidam bem com dados nulos */}
          <Text style={styles.userName}>{userData?.nome || 'Bem-vindo!'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <InfoBox label="Altura" value={`${userData?.altura || ''} m`} />
          <InfoBox label="Peso" value={`${userData?.peso || ''} kg`} />
          <InfoBox label="IMC" value={userData?.imc?.toFixed(2)} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Deslogar</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  infoBoxLabel: {
    fontSize: 14,
    color: 'gray',
  },
  infoBoxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EuScreen;