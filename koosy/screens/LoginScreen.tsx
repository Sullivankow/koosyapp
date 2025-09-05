import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

type LoginScreenProps = {
    onLogin?: () => void;
    onSignup?: () => void;
    onForgotPassword?: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Ici tu ajouteras la logique de paiement/validation
    const handleLogin = () => {
        // Vérifie les infos, effectue le paiement, etc.
        // Si tout est OK :
        onLogin?.();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connexion</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Se connecter" onPress={handleLogin} />

            <View style={styles.linksContainer}>
                <TouchableOpacity onPress={onSignup}>
                    <Text style={styles.link}>Pas encore inscrit ?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={styles.link}>Mot de passe oublié ?</Text>
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
        backgroundColor: '#F5F6FA',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#007AFF',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ECECEC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    linksContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    link: {
        color: '#007AFF',
        fontSize: 16,
        marginTop: 10,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
