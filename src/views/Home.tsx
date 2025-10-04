import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from "../navigation/types";
import supabase from '../supabaseClient';



export default function HomeView() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const handleLogout = () => {
    navigation.replace('Login');
  };
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    };

    fetchUser();
  }, []);

  return (
    
    <View style={styles.container}>

      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Página Inicial</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#00A572" />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      
      
      <View style={styles.content}>      
        {email ? (
        <Text>Usuário logado: {email}</Text>
      ) : (
        <Text>Nenhum usuário logado</Text>
      )}
        <Text style={styles.welcomeText}>
          Login realizado com sucesso!! 
        </Text>
        <Text style={styles.instructionText}>
          Esta é a página inicial da aplicação.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 8,
    color: '#00A572',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  instructionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});