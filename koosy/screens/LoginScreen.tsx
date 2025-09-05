import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';







type LoginScreenProps = {
    onLogin?: () => void;
    onSignup?: () => void;
    onForgotPassword?: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { colors, isDarkMode, toggleTheme } = useTheme();

    // Ici tu ajouteras la logique de paiement/validation
    const handleLogin = () => {
        // Vérifie les infos, effectue le paiement, etc.
        // Si tout est OK :
        onLogin?.();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Connexion</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Mot de passe"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Se connecter" onPress={handleLogin} color={colors.primary} />

            <View style={styles.linksContainer}>
                <TouchableOpacity onPress={onSignup}>
                    <Text style={[styles.link, { color: colors.primary }]}>Pas encore inscrit ?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={[styles.link, { color: colors.primary }]}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 30 }}>
                <Button
                    title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
                    onPress={toggleTheme}
                    color={colors.secondary}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        // backgroundColor: colors.background, // Utilisé dans le composant
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        // color: colors.primary, // Utilisé dans le composant
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        // backgroundColor: colors.surface, // Utilisé dans le composant
        // borderColor: colors.border, // Utilisé dans le composant
        // color: colors.text, // Utilisé dans le composant
    },
    linksContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    link: {
        // color: colors.primary, // Utilisé dans le composant
        fontSize: 16,
        marginTop: 10,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
