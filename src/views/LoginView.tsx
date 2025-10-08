import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import GradientBackground from '../../components/GrandientBackground';
import LoginButton from '../../components/LoginButton';
import LoginInput from '../../components/LoginInput';
import TabSelector from '../../components/TabSelector';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export default function LoginView() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading, 
    login, 
    signUp,
    showPassword, 
    toggleShowPassword,
    activeTab,
    switchTab,
    navigateToForgotPassword,
    //loginWithGoogle, // Mantido para futura referência
  } = useLoginViewModel();
  

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  const prevActiveTab = useRef(activeTab);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (prevActiveTab.current !== activeTab) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(tabFadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(tabSlideAnim, {
            toValue: -10,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(tabSlideAnim, {
          toValue: 10,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(tabFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(tabSlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      
      prevActiveTab.current = activeTab;
    }
  }, [activeTab, tabFadeAnim, tabSlideAnim]);

  const handleTabChange = (tab: 'login' | 'signup') => {
    switchTab(tab);
  };

  return (
    
    <GradientBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={RNStatusBar.currentHeight || 0}
      >
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <Animated.Text 
            style={[
              styles.title,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            Bem-vindo
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.subtitle,
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            Treine, compartilhe, evolua 🔥
          </Animated.Text>
        </View>
        
        <Animated.View 
          style={[
            styles.formContainer,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TabSelector 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            
            <Animated.View
              style={[
                styles.inputContainer,
                { 
                  opacity: tabFadeAnim,
                  transform: [{ translateY: tabSlideAnim }] 
                }
              ]}
            >
              <LoginInput
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
                iconName="mail-outline"
              />
              
              <LoginInput
                value={password}
                onChangeText={setPassword}
                placeholder={activeTab === 'login' ? "Digite sua senha" : "Crie uma senha"}
                secureTextEntry={!showPassword}
                iconName="lock-closed-outline"
                rightIcon={showPassword ? "eye-outline" :"eye-off-outline" }
                onRightIconPress={toggleShowPassword}
                disableAutofill={true}
                
              />
              
              {activeTab === 'signup' && (
                <>
                  <LoginInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirme sua senha"
                    secureTextEntry={!showPassword}
                    iconName="lock-closed-outline"
                    autoCapitalize="none"
                    disableAutofill={true}
                  />
                  
                  {password.length > 0 && (
                    <Text style={[
                      styles.strengthText,
                      { 
                        color: password.length < 6 ? 'red' : 
                              (password.length >= 8 ? 'green' : 'orange')
                      }
                    ]}>
                      Força da senha: {password.length < 6 ? 'Fraca' : 
                                      (password.length >= 8 ? 'Forte' : 'Média')}
                    </Text>
                  )}
                </>
              )}
              
              {activeTab === 'login' && (
                <Pressable 
                  onPress={navigateToForgotPassword}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                </Pressable>
              )}
              
              <LoginButton
                title={activeTab === 'login' ? "Entrar" : "Cadastrar"}
                onPress={activeTab === 'login' ? login : signUp}
                loading={loading}
                style={styles.loginButton}
              />
              
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>
              
              {/* 
              Botão Google desativado para futuras atualizações.
              Para reativar, descomente o código abaixo.
              */}
              
              <LoginButton
                title="Google"
                onPress={login}
                primary={false}
                icon="logo-google"
                style={styles.googleButton}
              />
              
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: -2,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 70,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inputContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#00A572',
  },
  loginButton: {
    width: '100%',
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#A1A1A1',
  },
  googleButton: {
    width: '100%',
  },
  strengthText: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
});
