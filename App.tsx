// App.tsx
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { Buffer } from 'buffer';
import process from 'process';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import RootNavigator from './src/navigation/RootNavigator';
import supabase from './src/supabaseClient';

// Polyfills para compatibilidade
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
if (typeof global.process === 'undefined') {
  global.process = process;
}

// Ref de navegação para poder navegar de fora dos componentes de tela
export const navigationRef = createNavigationContainerRef();

export default function App() {
  
  useEffect(() => {
    // Listener global do estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth Event] Evento: ${event}, Sessão:`, session ? 'Existe' : 'Nula');

      // Se o usuário fez logout ou a sessão se tornou nula por qualquer motivo (expirou, etc.)
      if (event === 'SIGNED_OUT' || !session) {
        // Garante que o container de navegação está pronto antes de navegar
        if (navigationRef.isReady()) {
          // Usa o ref para navegar para a tela de Login, resetando o histórico
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    });

    // Limpa o listener quando o componente é desmontado
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}