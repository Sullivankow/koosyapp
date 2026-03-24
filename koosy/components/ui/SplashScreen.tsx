import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const SplashScreen = () => {
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
    }, [rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={{ transform: [{ rotate }] }}>
                <FontAwesome5 name="key" size={80} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.text, { color: colors.primary }]}>Koosy</Text>
            <Text style={[styles.subtext, { color: colors.textSecondary }]}>Gestion de biens simplifiée</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: colors.background, // Utilisé dans le composant
    },
    text: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 30,
        // color: colors.primary, // Utilisé dans le composant
    },
    subtext: {
        fontSize: 16,
        // color: colors.textSecondary, // Utilisé dans le composant
    },
});

export default SplashScreen;