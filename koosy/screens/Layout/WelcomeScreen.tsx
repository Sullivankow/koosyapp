// screens/WelcomeScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const WelcomeScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2000); // 2 secondes
    return () => {
      clearTimeout(timer);
      rotateAnim.setValue(0);
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Animated.View style={{ transform: [{ rotate }] }}>
        <FontAwesome5 name="key" size={80} color={colors.primary} />
      </Animated.View>
      <Text style={[styles.text, { color: colors.primary }]}>Bienvenue sur Koosy !</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 32, fontWeight: 'bold', marginTop: 24 },
});

export default WelcomeScreen;