// src/navigation/MainTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native'; // Importações ESSENCIAIS

// Importe as telas
import ChatBotHeroScreen from '../views/ChatBotHiroScreen';
import DiaryScreen from '../views/DiaryScreen';
import EuScreen from '../views/EuScreen';
import RankingScreen from '../views/RankingScreen';
import SaudeScreen from '../views/SaudeScreen';
// Importe os ícones
import { ChatHeroIcon, HomeIcon, PearIcon, RankingIcon, UserIcon } from '../componentes/AppIcons';

const Tab = createBottomTabNavigator();

// Funções para garantir que o ícone e o texto customizados sejam renderizados
const getTabBarIcon = (route: any, color: string) => {
    switch (route.name) {
        case 'Home':
            return <HomeIcon color={color} />;
        case 'Diário':
            return <PearIcon color={color} />;
        case 'Chat Hiro':
            return <ChatHeroIcon color={color} />;
        case 'Ranking':
            return <RankingIcon color={color} />;
        case 'Eu':
            return <UserIcon color={color} />;
        default:
            return null;
    }
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#00695C',
                tabBarInactiveTintColor: '#A0A0A0',

                tabBarStyle: {
                    height: 100,
                    paddingBottom: 15,
                    paddingTop: 10,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                
                // CORREÇÃO CRÍTICA: Renderizar a label DENTRO de um componente <Text>
                // Para manter seu estilo 'tabBarLabelStyle', aplicamos ele aqui.
                tabBarLabel: ({ focused, color }) => (
                    <Text 
                        style={[
                            styles.tabBarLabelStyle, 
                            { color: focused ? '#00695C' : '#A0A0A0' }
                        ]}
                    >
                        {route.name}
                    </Text>
                ),
                
                // Mantenha seu estilo de item, mas vamos redefini-lo aqui para organização
                tabBarItemStyle: {
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                
                // Mantenha seu seletor de ícone
                tabBarIcon: ({ color }) => getTabBarIcon(route, color),
            })}
        >
            <Tab.Screen name="Home" component={SaudeScreen} />
            <Tab.Screen name="Diário" component={DiaryScreen} />

            <Tab.Screen
                name="Chat Hiro"
                component={ChatBotHeroScreen}
                options={{
                    tabBarHideOnKeyboard: true,
                }}
            />

            <Tab.Screen name="Ranking" component={RankingScreen} />
            <Tab.Screen name="Eu" component={EuScreen} />
        </Tab.Navigator>
    );
}

// Estilos extraídos do screenOptions para reutilização (opcional, mas limpa o código)
const styles = StyleSheet.create({
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 5,
        // Cor será sobrescrita por 'color' no tabarLabel
    },
});