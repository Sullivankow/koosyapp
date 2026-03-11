import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Utilisateur } from '../../models/models';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import EntrepriseProfileCard, { Entreprise } from '../../components/EntrepriseProfileCard';
// À remplacer par la récupération réelle depuis l'API
const initialEntreprise: Entreprise = {
    id: 1,
    nom: 'SARL Dupont',
    siret: '12345678901234',
    tva: 'FR12345678901',
    adresse: '12 rue de Paris',
    codePostal: '75001',
    ville: 'Paris',
    pays: 'France',
    email: 'contact@dupont.fr',
    telephone: '+33123456789',
    siteWeb: 'https://dupont.fr',
    logo: '',
};
import { useTheme } from '../../contexts/ThemeContext';
import { getMe, updateMe, apiFetch, deleteMe } from '../../utils/api';
import { clearSession } from '../../utils/session';
import { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const initialUser: Utilisateur = {
    id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    avatar: '',
    formule: 'gratuit',
};

const initialBank = {
    titulaire: '',
    iban: '',
    bic: '',
};

const ProfilScreen: React.FC = () => {
    const { colors } = useTheme();
    const appContext = useContext(AppContext);
    const [modeEdition, setModeEdition] = useState(false);
    const [user, setUser] = useState<Utilisateur>(initialUser);
    const [editUser, setEditUser] = useState<Utilisateur>(user);
    const [bankInfo, setBankInfo] = useState(initialBank);
    const [showBank, setShowBank] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Nouveau regex : accepte lettres, chiffres, majuscule, minuscule, caractères spéciaux
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"'<>,.?/]).{8,}$/;

    // Récupération des infos utilisateur via API
    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setUser(data);
                setEditUser(data);
            } catch (error) {
                console.error('Erreur API utilisateur:', error);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        try {
            if (showPasswordInput && newPassword.length > 0) {
                if (newPassword !== confirmPassword) {
                    Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
                    return;
                }
                if (!passwordRegex.test(newPassword)) {
                    Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.');
                    return;
                }
            }
            const payload: any = {
                nom: editUser.nom,
                prenom: editUser.prenom,
                email: editUser.email,
                telephone: editUser.telephone,
                avatar: editUser.avatar
            };
            if (showPasswordInput && newPassword.length > 0) {
                payload.password = newPassword;
            }
            await updateMe(payload);
            setUser(editUser);
            setModeEdition(false);
            setShowPasswordInput(false);
            setNewPassword('');
            setConfirmPassword('');
            if (payload.password) {
                Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès.');
            } else {
                Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.');
            }
        } catch (error) {
            Alert.alert('Erreur', "Impossible d'enregistrer les modifications.");
        }
    };

    const handleSubscribe = () => {
        if (!bankInfo.titulaire || !bankInfo.iban || !bankInfo.bic) {
            Alert.alert('Erreur', 'Veuillez remplir toutes les informations bancaires.');
            return;
        }
        setUser({ ...user, formule: 'payant' });
        Alert.alert('Abonnement', 'Votre abonnement payant est activé.');
    };

    const handleUnsubscribe = () => {
        setUser({ ...user, formule: 'gratuit' });
        Alert.alert('Abonnement', 'Vous êtes repassé à la formule gratuite.');
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Suppression du compte',
            'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMe();
                            await clearSession();
                            appContext?.setIsLoggedIn(false);
                        } catch (error) {
                            // ...log supprimé...
                            Alert.alert('Erreur', 'Impossible de supprimer le compte.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            <ScrollView
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={{ alignItems: 'center', padding: 18 }}
            >
                {/* Carte utilisateur native */}
                <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}> 
                    <View style={{ alignItems: 'center', marginBottom: 18 }}>
                        <Image
                            source={
                                (modeEdition ? editUser.avatar : user.avatar)
                                    ? { uri: modeEdition ? editUser.avatar : user.avatar }
                                    : require('../../assets/house.jpg')
                            }
                            style={styles.avatar}
                        />
                        {modeEdition ? (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                                value={editUser.avatar}
                                onChangeText={v => setEditUser({ ...editUser, avatar: v })}
                                placeholder="URL de l'avatar"
                                placeholderTextColor={colors.text}
                            />
                        ) : null}
                        {modeEdition ? (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                                value={editUser.nom}
                                onChangeText={v => setEditUser({ ...editUser, nom: v })}
                                placeholder="Nom"
                                placeholderTextColor={colors.text}
                            />
                        ) : <Text style={[styles.nom, { color: colors.text }]}>{user.nom}</Text>}
                        {modeEdition ? (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                                value={editUser.prenom}
                                onChangeText={v => setEditUser({ ...editUser, prenom: v })}
                                placeholder="Prénom"
                                placeholderTextColor={colors.text}
                            />
                        ) : <Text style={[styles.nom, { color: colors.text }]}>{user.prenom}</Text>}
                        <Text style={[styles.formuleBadge, { backgroundColor: colors.secondary, color: '#000' }]}>{user.formule === 'gratuit' ? 'Formule gratuite' : 'Formule payante'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="email" size={20} color={colors.primary} />
                        {modeEdition ? (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
                                value={editUser.email}
                                onChangeText={v => setEditUser({ ...editUser, email: v })}
                                placeholder="Email"
                                placeholderTextColor={colors.text}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        ) : <Text style={[styles.infoText, { color: colors.text }]}>{user.email}</Text>}
                    </View>
                    <View style={styles.infoRow}>
                        <FontAwesome name="phone" size={20} color={colors.primary} />
                        {modeEdition ? (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
                                value={editUser.telephone || ''}
                                onChangeText={v => setEditUser({ ...editUser, telephone: v })}
                                placeholder="Téléphone"
                                placeholderTextColor={colors.text}
                                keyboardType="phone-pad"
                            />
                        ) : <Text style={[styles.infoText, { color: colors.text }]}>{user.telephone}</Text>}
                    </View>
                    {/* Champ mot de passe */}
                    {showPasswordInput && modeEdition && (
                        <>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="lock" size={20} color={colors.primary} />
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Nouveau mot de passe"
                                placeholderTextColor={colors.text}
                                secureTextEntry
                            />
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="lock-check" size={20} color={colors.primary} />
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirmation du mot de passe"
                                placeholderTextColor={colors.text}
                                secureTextEntry
                            />
                        </View>
                        </>
                    )}
                    {/* Section abonnement */}
                    <View style={{ marginVertical: 16 }}>
                        {user.formule === 'gratuit' ? (
                            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={() => setShowBank(!showBank)}>
                                <MaterialCommunityIcons name="credit-card" size={20} color={colors.surface} />
                                <Text style={[styles.btnText, { color: colors.surface }]}>Passer à la formule payante</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: colors.secondary }]} onPress={handleUnsubscribe}>
                                <MaterialCommunityIcons name="credit-card-remove" size={20} color="#000" />
                                <Text style={[styles.btnText, { color: '#000' }]}>Se désabonner</Text>
                            </TouchableOpacity>
                        )}
                        {showBank && (
                            <View style={styles.bankCard}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: 8 }}>Informations bancaires</Text>
                                <Text style={{ fontWeight: 'bold', color: '#000', marginBottom: 4 }}>Titulaire du compte</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                                    value={bankInfo.titulaire}
                                    onChangeText={v => setBankInfo({ ...bankInfo, titulaire: v })}
                                    placeholder="Ex : Jean Dupont"
                                    placeholderTextColor={colors.text}
                                />
                                <Text style={{ fontWeight: 'bold', color: '#000', marginBottom: 4 }}>IBAN</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                                    value={bankInfo.iban}
                                    onChangeText={v => setBankInfo({ ...bankInfo, iban: v })}
                                    placeholder="Ex : FR76 3000 6000 0112 3456 7890 189"
                                    placeholderTextColor={colors.text}
                                />
                                <Text style={{ fontWeight: 'bold', color: '#000', marginBottom: 4 }}>BIC</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
                                    value={bankInfo.bic}
                                    onChangeText={v => setBankInfo({ ...bankInfo, bic: v })}
                                    placeholder="Ex : AGRIFRPP"
                                    placeholderTextColor={colors.text}
                                />
                                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={handleSubscribe}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.surface} />
                                    <Text style={[styles.btnText, { color: colors.surface }]}>Valider l'abonnement</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={() => modeEdition ? handleSave() : setModeEdition(true)}>
                            <MaterialCommunityIcons name={modeEdition ? "content-save" : "account-edit"} size={20} color={colors.surface} />
                            <Text style={[styles.btnText, { color: colors.surface }]}>{modeEdition ? 'Enregistrer' : 'Modifier le profil'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: colors.secondary }]} onPress={() => {
                            setShowPasswordInput(true);
                        }}>
                            <MaterialCommunityIcons name="lock-reset" size={20} color="#000" />
                            <Text style={[styles.btnText, { color: '#000' }]}>Modifier le mot de passe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnDanger, { backgroundColor: '#d32f2f' }]} onPress={() => {
                            handleDeleteAccount();
                        }}>
                            <MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
                            <Text style={[styles.btnText, { color: colors.surface }]}>Supprimer mon compte</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Carte entreprise (à remplacer par la vraie donnée API) */}
                <EntrepriseProfileCard entreprise={initialEntreprise} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 28,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#009688',
    },
    nom: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#222',
    },
    formuleBadge: {
        backgroundColor: '#e0f7fa',
        color: '#000',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        fontSize: 14,
        marginTop: 4,
        marginBottom: 10,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 16,
        marginBottom: 4,
        backgroundColor: 'transparent',
    },
    bankCard: {
        backgroundColor: '#f7f7f7',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    actions: {
        marginTop: 18,
    },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#009688',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        justifyContent: 'center',
    },
    btnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f7fa',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        justifyContent: 'center',
    },
    btnDanger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d32f2f',
        padding: 12,
        borderRadius: 10,
        justifyContent: 'center',
    },
    btnText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default ProfilScreen;


