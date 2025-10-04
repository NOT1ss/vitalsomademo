import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

// Importe as telas
import ChatBotHeroScreen from '../views/ChatBotHiroScreen';
import DiaryScreen from '../views/DiaryScreen';
import EuScreen from '../views/EuScreen';
import RankingScreen from '../views/RankingScreen';
import SaudeScreen from '../views/SaudeScreen';
// Importe os ícones
import { ChatHeroIcon, HomeIcon, PearIcon, RankingIcon, UserIcon } from '../componentes/AppIcons';

const Tab = createBottomTabNavigator();

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
          // position: 'absolute', // <<<<<<<<<<<<<<<<<<<< REMOVA ESTA LINHA
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 5,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIcon: ({ color }) => {
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
        },
      })}
    >
      <Tab.Screen name="Home" component={SaudeScreen} />
      <Tab.Screen name="Diário" component={DiaryScreen} />
      
      {/* APLIQUE A OPÇÃO ESPECIAL APENAS NA TELA DE CHAT */}
      <Tab.Screen 
        name="Chat Hiro" 
        component={ChatBotHeroScreen} 
        options={{
          tabBarHideOnKeyboard: true, // <<<<<<<<<<<<<<<<<<<< ADICIONE ISTO
        }}
      />
      
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Eu" component={EuScreen} />
    </Tab.Navigator>
  );
}