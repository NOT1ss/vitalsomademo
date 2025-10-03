// src/views/CalendarioCompletoScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DiaSemana } from '../models/semanaTreinoModel';
import { RootStackParamList } from '../navigation/types';

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type CalendarioRouteProp = RouteProp<RootStackParamList, 'CalendarioCompleto'>;

export default function CalendarioCompletoScreen() {
  const navigation = useNavigation();
  const route = useRoute<CalendarioRouteProp>();
  
  // CORREÇÃO: Pega os 'dias' dos parâmetros, com um fallback para um array vazio
  const dias = route.params?.dias || [];

  const [date, setDate] = useState(new Date());

  const generateCalendar = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      // CORREÇÃO: Especifica o tipo do parâmetro 'd' para o TypeScript
      const diaCorrespondente = dias.find((d: DiaSemana) => d.numero === day && d.data.getMonth() === month);
      
      calendarDays.push(
        <TouchableOpacity key={day} style={styles.dayCell}>
          <Text style={styles.dayText}>{day}</Text>
          {diaCorrespondente?.status === 'concluido' && <View style={[styles.statusDot, {backgroundColor: '#16A34A'}]} />}
          {diaCorrespondente?.status === 'nao_realizado' && <View style={[styles.statusDot, {backgroundColor: '#DC2626'}]} />}
        </TouchableOpacity>
      );
    }
    return calendarDays;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{`${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`}</Text>
        </View>
        <View style={styles.weekDaysContainer}>
            {DAYS_OF_WEEK.map(day => <Text key={day} style={styles.weekDayText}>{day}</Text>)}
        </View>
        <View style={styles.calendarGrid}>
            {generateCalendar()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
    backButton: { position: 'absolute', left: 0 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    weekDaysContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    weekDayText: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#888' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#eee' },
    dayText: { fontSize: 16 },
    statusDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', bottom: 8 },
});