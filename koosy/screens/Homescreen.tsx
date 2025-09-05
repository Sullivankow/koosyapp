import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { LightColors, DarkColors } from '../constants/Colors';

function HomeScreen() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const Colors = isDarkMode ? DarkColors : LightColors;

    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <Text style={[styles.title, { color: Colors.primary }]}>Accueil Koosy</Text>
            <Text style={[styles.subtitle, { color: Colors.text }]}>Bienvenue sur votre app de gestion de biens en conciergerie</Text>
            <View style={styles.switchContainer}>
                <Text style={{ color: Colors.textSecondary }}>Mode nuit</Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    thumbColor={Colors.primary}
                    trackColor={{ false: Colors.border, true: Colors.secondary }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
});

export default HomeScreen;