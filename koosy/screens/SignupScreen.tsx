import React, { useState } from 'react';
import { signup } from '../utils/api';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type SignupScreenProps = {
    onSignupSuccess?: (email?: string, password?: string) => void;
    onBack?: () => void;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const { colors } = useTheme();

    // Validation email (format classique)
    const isEmailValid = (val: string) =>
        /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/.test(val.trim());

    // Validation mot de passe robuste (min 8, majuscule, chiffre, spécial)
    // Correction SonarQube : suppression de l'antislash inutile dans le groupe spécial
    const isPasswordStrong = (val: string) =>
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(val);

    const handleSignup = async () => {
        let valid = true;
        if (!isPasswordStrong(password)) {
            setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.");
            valid = false;
        } else {
            setPasswordError("");
        }
        if (password !== confirmPassword) {
            setConfirmError("Les mots de passe ne correspondent pas.");
            valid = false;
        } else {
            setConfirmError("");
        }
        if (!email.trim() || !password.trim() || !isEmailValid(email) || !valid || !nom.trim() || !prenom.trim()) {
            return;
        }
        try {
            await signup({ nom, prenom, email, password });
            onSignupSuccess?.(email, password);
        } catch (err: any) {
            setPasswordError("Erreur lors de l'inscription : " + (err.message || ''));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Inscription</Text>
            {/* NOM */}
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Nom"
                placeholderTextColor={colors.textSecondary}
                value={nom}
                onChangeText={setNom}
                autoCapitalize="words"
            />
            {/* PRENOM */}
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Prénom"
                placeholderTextColor={colors.textSecondary}
                value={prenom}
                onChangeText={setPrenom}
                autoCapitalize="words"
            />
            {/* EMAIL */}
            <View style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="Email"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {(() => {
                        if (email.length > 0) {
                            if (isEmailValid(email)) {
                                return <MaterialCommunityIcons name="check-circle" size={22} color="green" style={{ marginLeft: 8 }} />;
                            } else {
                                return <MaterialCommunityIcons name="close-circle" size={22} color="red" style={{ marginLeft: 8 }} />;
                            }
                        }
                        return null;
                    })()}
                </View>
                {(() => {
                    let emailValidationMessage = null;
                    if (email.length > 0) {
                        if (isEmailValid(email)) {
                            emailValidationMessage = (
                                <Text style={{ color: 'green', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                                    Email valide !
                                </Text>
                            );
                        } else {
                            emailValidationMessage = (
                                <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                                    Format d'email invalide.
                                </Text>
                            );
                        }
                    }
                    return emailValidationMessage;
                })()}
            </View>
            {/* MOT DE PASSE */}
            <View style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="Mot de passe"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    {isPasswordStrong(password) && password.length > 0 ? (
                        <MaterialCommunityIcons name="check-circle" size={22} color="green" style={{ marginLeft: 8 }} />
                    ) : null}
                </View>
                {password.length > 0 && isPasswordStrong(password) ? (
                    <Text style={{ color: 'green', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                        Mot de passe robuste !
                    </Text>
                ) : (
                    <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                        {passwordError || 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'}
                    </Text>
                )}
            </View>
            {/* CONFIRMATION MOT DE PASSE */}
            <View style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="Confirmer le mot de passe"
                        placeholderTextColor={colors.textSecondary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                    {(() => {
                        let icon = null;
                        if (confirmPassword.length > 0) {
                            if (password === confirmPassword) {
                                icon = <MaterialCommunityIcons name="check-circle" size={22} color="green" style={{ marginLeft: 8 }} />;
                            } else {
                                icon = <MaterialCommunityIcons name="close-circle" size={22} color="red" style={{ marginLeft: 8 }} />;
                            }
                        }
                        return icon;
                    })()}
                </View>
                {(() => {
                    let confirmPasswordMessage = null;
                    if (confirmPassword.length > 0) {
                        if (password === confirmPassword) {
                            confirmPasswordMessage = (
                                <Text style={{ color: 'green', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                                    Les mots de passe sont identiques.
                                </Text>
                            );
                        } else {
                            confirmPasswordMessage = (
                                <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                                    Les mots de passe ne correspondent pas.
                                </Text>
                            );
                        }
                    }
                    return confirmPasswordMessage;
                })()}
                {confirmError ? (
                    <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 5, fontSize: 13 }}>
                        {confirmError}
                    </Text>
                ) : null}
            </View>
            <Button
                title="S'inscrire"
                onPress={handleSignup}
                color={colors.primary}
                disabled={!email.trim() || !password.trim() || !isEmailValid(email) || !isPasswordStrong(password) || password !== confirmPassword || !nom.trim() || !prenom.trim()}
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
