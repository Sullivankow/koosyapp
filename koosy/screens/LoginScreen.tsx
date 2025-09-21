import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { login } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';







type LoginScreenProps = {
    onLogin?: (email?: string, password?: string) => void;
    onSignup?: () => void;
    onForgotPassword?: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { colors, isDarkMode, toggleTheme } = useTheme();

    // Ici tu ajouteras la logique de paiement/validation
    // Regex email simple
    const isEmailValid = (val: string) =>
        /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/.test(val.trim());

    // Récupère les identifiants mémorisés si existants
    useEffect(() => {
        AsyncStorage.getItem('koosy_login').then(data => {
            if (data) {
                try {
                    const { email, password } = JSON.parse(data);
                    setEmail(email);
                    setPassword(password);
                    setRememberMe(true);
                } catch { }
            }
        });
    }, []);

    const handleLogin = async () => {
        setError(null);
        if (!email.trim() || !password.trim() || !isEmailValid(email)) return;
        try {
            const res = await login({ email, password });
            // res.access_token contient le token JWT
            // res.prenom doit être retourné par le backend
            if (res.prenom) {
                await AsyncStorage.setItem('koosy_user', JSON.stringify({ prenom: res.prenom }));
            }
            if (rememberMe) {
                await AsyncStorage.setItem('koosy_login', JSON.stringify({ email, password }));
            } else {
                await AsyncStorage.removeItem('koosy_login');
            }
            onLogin?.(email, password);
        } catch (err) {
            setError('Identifiants invalides');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Connexion</Text>
            {error && (
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
            )}
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Mot de passe"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={22}
                        color={colors.textSecondary}
                        style={{ marginLeft: 8 }}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Switch
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={rememberMe ? colors.primary : colors.surface}
                    />
                    <Text style={{ marginLeft: 8, color: colors.text }}>Mémoriser mes identifiants</Text>
                </View>
                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    color={colors.primary}
                    disabled={!email.trim() || !password.trim() || !isEmailValid(email)}
                />
            </View>

            <View style={styles.linksContainer}>
                <TouchableOpacity onPress={onSignup}>
                    <Text style={[styles.link, { color: colors.primary }]}>Pas encore inscrit ?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={[styles.link, { color: colors.primary }]}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
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
