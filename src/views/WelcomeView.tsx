import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { useWelcomeViewModel } from '../viewmodels/useWelcomeViewModel';

export default function WelcomeView() {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const { checkUserAsync, navigation } = useWelcomeViewModel();

  const [animationDone, setAnimationDone] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [nextScreen, setNextScreen] = useState<'Login' | 'MainApp' | null>(null);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 1999,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        setAnimationDone(true);
      }, 10);
    });

    // Checa usuário em paralelo
    (async () => {
      const screen = await checkUserAsync(); // retorna 'Login' ou 'Home'
      setNextScreen(screen);
      setUserChecked(true);
    })();
  }, []);

  useEffect(() => {
    if (animationDone && userChecked && nextScreen) {
      navigation.navigate(nextScreen);
    }
  }, [animationDone, userChecked, nextScreen]);

  const maskHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/1.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Animated.View
        style={[
          styles.logoOverlay,
          { height: maskHeight },
        ]}
      >
        <Image
          source={require('../../assets/images/2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  logoOverlay: {
    position: 'absolute',
    bottom: '35%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
});
