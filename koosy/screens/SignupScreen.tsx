import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type SignupScreenProps = {
    onSignupSuccess?: (email?: string, password?: string) => void;
    onBack?: () => void;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { colors } = useTheme();

    // Regex email simple
    const isEmailValid = (val: string) =>
        /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/.test(val.trim());

    const handleSignup = () => {
        if (!email.trim() || !password.trim() || !isEmailValid(email) || password !== confirmPassword) {
            alert("Veuillez remplir tous les champs correctement.");
            return;
        }
        onSignupSuccess?.(email, password);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Inscription</Text>
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
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <Button
                title="S'inscrire"
                onPress={handleSignup}
                color={colors.primary}
                disabled={!email.trim() || !password.trim() || !isEmailValid(email) || password !== confirmPassword}
            />
            <Button title="Retour" onPress={onBack} color={colors.secondary} />
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
});

export default SignupScreen;
