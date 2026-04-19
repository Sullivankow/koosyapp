// Écran de gestion du profil utilisateur et de l'entreprise.
// - Charge les informations de l'utilisateur connecté et de son entreprise
// - Permet la modification des infos de profil et du mot de passe
// - Gère un formulaire local pour les informations bancaires et l'abonnement
// - Offre la création/suppression de l'entreprise liée au compte.
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { Utilisateur, Subscription } from '../../models/models';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import EntrepriseProfileCard, { Entreprise } from '../../components/cards/EntrepriseProfileCard';
import AbonnementCard from '../../components/cards/AbonnementCard';
import SubscriptionPaywallModal from '../../components/modals/SubscriptionPaywallModal';
import { getEntrepriseById } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import { getMe, updateMe, deleteMe } from '../../utils/api';
import { logoutCurrentSession } from '../../utils/api';
import { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { createEntreprise } from '../../utils/api';
import { useSubscription } from '../../hooks/useSubscription';

const initialUser: Utilisateur = {
    id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    avatar: '',
    formule: 'gratuit',
    role: '',
};

const initialBank = {
    titulaire: '',
    iban: '',
    bic: '',
};

const initialEntreprise: Omit<Entreprise, 'id'> = {
    nom: '',
    siret: '',
    tva: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: '',
    email: '',
    telephone: '',
    siteWeb: '',
    logo: '',
};

const ProfilScreen: React.FC = () => {
    const [modeEdition, setModeEdition] = useState(false);
    // ...log supprimé...
    const { colors } = useTheme();
    const appContext = useContext(AppContext);
    const [user, setUser] = useState<Utilisateur>(initialUser);
    const [editUser, setEditUser] = useState<Utilisateur>(user);
    const [bankInfo, setBankInfo] = useState(initialBank);
    const [showBank, setShowBank] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showEntrepriseForm, setShowEntrepriseForm] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [newEntreprise, setNewEntreprise] = useState<Omit<Entreprise, 'id'>>(initialEntreprise);
    const [showSubscriptionCard, setShowSubscriptionCard] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    // Nouveau regex : accepte lettres, chiffres, majuscule, minuscule, caractères spéciaux
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"'<>,.?/]).{8,}$/;
    const userPlan = (user as any).formule ?? (user as any).abonnement ?? 'gratuit';
    const isPaidPlan = userPlan === 'payant' || userPlan === 'premium';

    const { getMySubscription, loading: subscriptionLoading, error: subscriptionError, cancelSubscription: cancelStripeSubscription } = useSubscription('');

    // État pour l'entreprise réelle
    const [entreprise, setEntreprise] = useState<Entreprise | null>(null);

    // Récupère les informations utilisateur et, si présente, son entreprise associée.
    // Met à jour à la fois l'état "user" (affichage) et "editUser" (mode édition).
    const refreshEntreprise = async () => {
        try {
            const data = await getMe();
            setUser(data);
            setEditUser(data);
            if (data.entreprise && data.entreprise.id) {
                const ent = await getEntrepriseById(data.entreprise.id);
                setEntreprise(ent);
            } else {
                setEntreprise(null);
            }
        } catch (error) {
            console.error('Erreur API utilisateur/entreprise:', error);
        }
    };

    // Récupération initiale des données de profil et d'entreprise au montage du composant.
    React.useEffect(() => {
        refreshEntreprise();
    }, []);

    React.useEffect(() => {
        const loadSubscription = async () => {
            const data = await getMySubscription();
            setSubscription(data as Subscription | null);
        };

        loadSubscription();
    }, [getMySubscription]);

    // Sauvegarde des informations de profil (et éventuellement du mot de passe) côté API.
    // Valide d'abord la cohérence et la robustesse du mot de passe si l'utilisateur souhaite le modifier.
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
                role: editUser.role || user.role || 'user'
            };
            if (showPasswordInput && newPassword.length > 0) {
                payload.password = newPassword;
            }
            // ...log supprimé...
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
            let msg = "Impossible d'enregistrer les modifications.";
            if (typeof error === 'object' && error !== null && 'message' in error) {
                msg += `\n${(error as any).message}`;
            } else if (typeof error === 'string') {
                msg += `\n${error}`;
            } else {
                msg += `\n${JSON.stringify(error)}`;
            }
            Alert.alert('Erreur', msg);
        }
    };

    // Active un abonnement "payant" en utilisant les informations bancaires saisies
    // (logique purement locale pour l'instant, sans appel API).
    const handleSubscribe = () => {
        setShowPaywall(true);
    };

    // Demande l'annulation réelle de l'abonnement côté backend/Stripe.
    const handleUnsubscribe = async () => {
        try {
            const result = await cancelStripeSubscription(false);
            if (!result) {
                Alert.alert('Erreur', 'Impossible d’annuler l’abonnement.');
                return;
            }

            // On recharge l'abonnement pour afficher le statut réel côté carte.
            const refreshed = await getMySubscription();
            setSubscription(refreshed as Subscription | null);

            Alert.alert('Abonnement', 'Votre abonnement sera annulé en fin de période.');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d’annuler l’abonnement.');
        }
    };

    // Confirme avec l'utilisateur puis supprime le compte côté API,
    // efface la session locale et déconnecte l'utilisateur.
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
                            await logoutCurrentSession();
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

    // Affiche le formulaire de création d'entreprise lorsque l'utilisateur n'en a pas encore.
    const handleAddEntreprise = () => {
        setShowEntrepriseForm(true);
    };

    const handleToggleSubscriptionCard = async () => {
        setShowSubscriptionCard(prev => !prev);

        if (!subscription) {
            const data = await getMySubscription();
            setSubscription(data as Subscription | null);
        }
    };

    // Valide le formulaire puis crée une nouvelle entreprise côté API.
    // En cas de succès, on met à jour l'état local et on masque le formulaire.
    const handleCreateEntreprise = async () => {
        try {
            if (!newEntreprise.nom || !newEntreprise.siret || newEntreprise.siret.length !== 14) {
                Alert.alert('Erreur', 'Le nom et un SIRET valide (14 chiffres) sont obligatoires.');
                return;
            }
            // DEBUG : log des données envoyées
            // ...log supprimé...
            const created = await createEntreprise(newEntreprise);
            setEntreprise(created);
            setShowEntrepriseForm(false);
            Alert.alert('Succès', 'Entreprise créée avec succès.');
        } catch (error) {
            Alert.alert('Erreur', "Impossible de créer l'entreprise.");
        }
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
                        {(modeEdition ? editUser.avatar : user.avatar) ? (
                            <Image
                                source={{ uri: modeEdition ? editUser.avatar : user.avatar }}
                                style={styles.avatar}
                            />
                        ) : (
                            <MaterialCommunityIcons name="account-circle" size={80} color={colors.primary} style={{ marginBottom: 8 }} />
                        )}
                        {/* Suppression du champ URL de l'avatar en mode édition */}
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
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleToggleSubscriptionCard}
                            style={styles.badgePressable}
                        >
                            <View style={[styles.formuleBadge, { backgroundColor: colors.secondary, opacity: isPaidPlan ? 1 : 0.85 }]}>
                                <View style={styles.badgeRow}>
                                    <Text style={styles.badgeText}>{isPaidPlan ? 'Formule payante' : 'Formule gratuite'}</Text>
                                    {isPaidPlan ? <MaterialCommunityIcons name="chevron-down" size={18} color="#000" style={{ marginLeft: 4 }} /> : null}
                                </View>
                                <Text style={styles.badgeHint}>Appuyez pour voir les détails</Text>
                            </View>
                        </TouchableOpacity>
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
                            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={handleSubscribe}>
                                <MaterialCommunityIcons name="credit-card" size={20} color={colors.surface} />
                                <Text style={[styles.btnText, { color: colors.surface }]}>Passer à la formule payante</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: colors.secondary }]} onPress={handleUnsubscribe}>
                                <MaterialCommunityIcons name="credit-card-remove" size={20} color="#000" />
                                <Text style={[styles.btnText, { color: '#000' }]}>Se désabonner</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={{ marginTop: 10, color: colors.textSecondary, textAlign: 'center' }}>
                            Vous serez redirigé vers l'abonnement sécurisé.
                        </Text>
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
                    </View>
                    {/* Lien discret pour suppression de compte */}
                    <TouchableOpacity
                        style={{ alignSelf: 'center', marginTop: 18, marginBottom: 4, padding: 4 }}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.7}
                    >
                        <Text style={{ color: colors.textSecondary, fontSize: 13, textDecorationLine: 'underline' }}>
                            Supprimer mon compte
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 2 }}>
                            Action irréversible
                        </Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={showSubscriptionCard}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowSubscriptionCard(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <AbonnementCard
                                subscription={subscription}
                                loading={subscriptionLoading}
                                error={subscriptionError}
                                onClose={() => setShowSubscriptionCard(false)}
                            />
                        </View>
                    </View>
                </Modal>
                <SubscriptionPaywallModal
                    isOpen={showPaywall}
                    onClose={() => setShowPaywall(false)}
                    onSubscribe={() => setShowPaywall(false)}
                />
                                {/* Carte entreprise (affiche la vraie donnée API si dispo) */}
                                {entreprise && (
                                    <EntrepriseProfileCard 
                                        entreprise={entreprise} 
                                        onEdit={async () => {
                                            await refreshEntreprise();
                                            Alert.alert('Succès', 'Informations de l’entreprise mises à jour.');
                                        }}
                                        onDelete={async () => {
                                            await refreshEntreprise();
                                            Alert.alert('Succès', 'Entreprise supprimée avec succès.');
                                        }}
                                    />
                                )}
                {/* Formulaire d'ajout d'entreprise */}
                {!entreprise && showEntrepriseForm && (
                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text, marginTop: 24 }]}> 
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: colors.primary }}>Nouvelle entreprise</Text>
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Nom de l'entreprise" placeholderTextColor={colors.text} value={newEntreprise.nom} onChangeText={v => setNewEntreprise({ ...newEntreprise, nom: v })} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="SIRET" placeholderTextColor={colors.text} value={newEntreprise.siret} onChangeText={v => setNewEntreprise({ ...newEntreprise, siret: v })} keyboardType="numeric" />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="TVA (optionnel)" placeholderTextColor={colors.text} value={newEntreprise.tva} onChangeText={v => setNewEntreprise({ ...newEntreprise, tva: v })} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Adresse" placeholderTextColor={colors.text} value={newEntreprise.adresse} onChangeText={v => setNewEntreprise({ ...newEntreprise, adresse: v })} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Code postal" placeholderTextColor={colors.text} value={newEntreprise.codePostal} onChangeText={v => setNewEntreprise({ ...newEntreprise, codePostal: v })} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Ville" placeholderTextColor={colors.text} value={newEntreprise.ville} onChangeText={v => setNewEntreprise({ ...newEntreprise, ville: v })} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Pays" placeholderTextColor={colors.text} value={newEntreprise.pays} onChangeText={v => setNewEntreprise({ ...newEntreprise, pays: v })} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Email professionnel" placeholderTextColor={colors.text} value={newEntreprise.email} onChangeText={v => setNewEntreprise({ ...newEntreprise, email: v })} keyboardType="email-address" autoCapitalize="none" />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Téléphone" placeholderTextColor={colors.text} value={newEntreprise.telephone} onChangeText={v => setNewEntreprise({ ...newEntreprise, telephone: v })} keyboardType="phone-pad" />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Site web" placeholderTextColor={colors.text} value={newEntreprise.siteWeb} onChangeText={v => setNewEntreprise({ ...newEntreprise, siteWeb: v })} autoCapitalize="none" />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.primary }]} placeholder="Logo (URL)" placeholderTextColor={colors.text} value={newEntreprise.logo} onChangeText={v => setNewEntreprise({ ...newEntreprise, logo: v })} />
                        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary, marginTop: 12 }]} onPress={handleCreateEntreprise}>
                            <MaterialCommunityIcons name="content-save" size={20} color={colors.surface} />
                            <Text style={[styles.btnText, { color: colors.surface }]}>Enregistrer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: colors.secondary, marginTop: 8 }]} onPress={() => setShowEntrepriseForm(false)}>
                            <MaterialCommunityIcons name="close" size={20} color="#000" />
                            <Text style={[styles.btnText, { color: '#000' }]}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Bouton ajouter une entreprise */}
                {!entreprise && !showEntrepriseForm && (
                    <TouchableOpacity
                        style={[styles.btnPrimary, { backgroundColor: colors.primary, marginTop: 24, marginBottom: 18 }]}
                        onPress={handleAddEntreprise}
                    >
                        <MaterialCommunityIcons name="plus-circle" size={20} color={colors.surface} />
                        <Text style={[styles.btnText, { color: colors.surface }]}>Ajouter une entreprise</Text>
                    </TouchableOpacity>
                )}
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
    },
    modalContent: {
        width: '100%',
        maxWidth: 520,
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
    badgePressable: {
        alignSelf: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    badgeHint: {
        color: '#000',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'center',
        opacity: 0.8,
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


