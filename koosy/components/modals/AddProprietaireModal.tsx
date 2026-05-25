// Modale de création d'un propriétaire
// - Affiche un petit formulaire (nom, prénom, email, adresse, téléphone)
// - Valide les champs obligatoires
// - Appelle l'API createProprietaire puis remonte le propriétaire créé au parent

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Dimensions, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createProprietaire, getProprietaireQuota, ProprietaireQuota } from '../../utils/proprietaireApi';
import SubscriptionPaywallModal from './SubscriptionPaywallModal';
import type { Proprietaire } from '../../models/models';

interface AddProprietaireModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess?: (proprio: Proprietaire) => void;
}

// Structure d'état pour le formulaire de propriétaire
type ProprietaireFormState = {
	nom: string;
	prenom: string;
	email: string;
	adresse: string;
	telephone: string;
};

// Valeurs initiales du formulaire (champs vides)
const buildInitialForm = (): ProprietaireFormState => ({
	nom: '',
	prenom: '',
	email: '',
	adresse: '',
	telephone: '',
});

// Vérifie que les champs obligatoires sont renseignés
// Retourne un message d'erreur (string) ou null si tout est OK
const validateForm = (form: ProprietaireFormState): string | null => {
	if (!form.nom || !form.prenom || !form.email) {
		return 'Nom, prénom et email sont obligatoires';
	}
	return null;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// Composant principal de la modale "Nouveau propriétaire"
const AddProprietaireModal: React.FC<AddProprietaireModalProps> = ({ visible, onClose, onSuccess }) => {
	const { colors } = useTheme();
	const [form, setForm] = useState<ProprietaireFormState>(buildInitialForm);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	// Gestion du quota
	const [quota, setQuota] = useState<ProprietaireQuota | null>(null);
	const [quotaLoading, setQuotaLoading] = useState(false);
	const [quotaError, setQuotaError] = useState<string | null>(null);
	const [showPaywall, setShowPaywall] = useState(false);
	// Chargement du quota à l'ouverture de la modale
	useEffect(() => {
		if (!visible) return;
		setQuotaLoading(true);
		setQuotaError(null);
		getProprietaireQuota()
			.then((q) => {
				setQuota(q);
				setQuotaError(null);
			})
			.catch(() => {
				setQuota(null);
				setQuotaError('Quota indisponible pour le moment. Vérifiez que le backend est redémarré.');
			})
			.finally(() => setQuotaLoading(false));
	}, [visible]);

	// Met à jour un champ du formulaire de manière générique
	const updateField = useCallback(
		(field: keyof ProprietaireFormState, value: string) => {
			setForm(prev => ({ ...prev, [field]: value }));
		},
		[],
	);

	// Soumission du formulaire avec gestion du quota
	const handleSubmit = async () => {
		setError('');
		if (quota && quota.isLimited && (quota.remaining ?? 0) <= 0) {
			setShowPaywall(true);
			return;
		}
		const validationError = validateForm(form);
		if (validationError) {
			setError(validationError);
			return;
		}
		setLoading(true);
		try {
			const proprio = await createProprietaire(form);
			setForm(buildInitialForm());
			setLoading(false);
			onClose();
			if (onSuccess) onSuccess(proprio);
			Alert.alert('Succès', 'Propriétaire créé avec succès');
		} catch (e) {
			setLoading(false);
			setError("Erreur lors de la création du propriétaire");
		}
	};

	return (
		<>
			<Modal visible={visible} animationType="slide" transparent>
				<KeyboardAvoidingView behavior="padding" style={[styles.centered, { backgroundColor: colors.shadow }]}>
					<View style={[styles.modal, { backgroundColor: colors.surface, width: SCREEN_WIDTH > 500 ? 400 : '90%', shadowColor: colors.shadow }]}> 
						<Text style={[styles.title, { color: colors.primary }]}>Nouveau propriétaire</Text>
						{/* Affichage du quota */}
						<View style={{ marginBottom: 10 }}>
							{quotaLoading ? (
								<Text style={{ color: colors.text, fontWeight: '700' }}>Chargement du quota...</Text>
							) : quotaError ? (
								<Text style={{ color: colors.error, fontWeight: '700' }}>{quotaError}</Text>
							) : quota?.isLimited ? (
								<>
									<Text style={{ color: colors.text, fontWeight: '700' }}>
										Plan gratuit: {quota.used}/{quota.limit} propriétaires utilisés
									</Text>
									<Text style={{ color: colors.text }}>
										Il vous reste {quota.remaining ?? 0} création(s) gratuite(s).
									</Text>
								</>
							) : quota ? (
								<Text style={{ color: colors.text, fontWeight: '700' }}>
									{quota.accessLevel === 'beta'
										? 'Accès bêta: créations de propriétaires illimitées pendant la période de test.'
										: 'Plan premium: créations de propriétaires illimitées.'}
								</Text>
							) : (
								<Text style={{ color: colors.text, fontWeight: '700' }}>Quota non disponible.</Text>
							)}
						</View>
						<TextInput
							style={[styles.input, { color: colors.text, borderColor: colors.border }]}
							placeholder="Nom*"
							placeholderTextColor={colors.text + 'CC'}
							value={form.nom}
							onChangeText={v => updateField('nom', v)}
							autoFocus
						/>
						<TextInput
							style={[styles.input, { color: colors.text, borderColor: colors.border }]}
							placeholder="Prénom*"
							placeholderTextColor={colors.text + 'CC'}
							value={form.prenom}
							onChangeText={v => updateField('prenom', v)}
						/>
						<TextInput
							style={[styles.input, { color: colors.text, borderColor: colors.border }]}
							placeholder="Email*"
							placeholderTextColor={colors.text + 'CC'}
							value={form.email}
							onChangeText={v => updateField('email', v)}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<TextInput
							style={[styles.input, { color: colors.text, borderColor: colors.border }]}
							placeholder="Adresse"
							placeholderTextColor={colors.text + 'CC'}
							value={form.adresse}
							onChangeText={v => updateField('adresse', v)}
						/>
						<TextInput
							style={[styles.input, { color: colors.text, borderColor: colors.border }]}
							placeholder="Téléphone"
							placeholderTextColor={colors.text + 'CC'}
							value={form.telephone}
							onChangeText={v => updateField('telephone', v)}
							keyboardType="phone-pad"
						/>
						{error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
						<View style={styles.rowBtns}>
							<TouchableOpacity
								style={[styles.btn, { backgroundColor: colors.primary }]}
								onPress={handleSubmit}
								disabled={loading}
							>
								<Text style={{ color: colors.surface, fontWeight: 'bold' }}>{loading ? 'Création...' : 'Créer'}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.btn, { backgroundColor: colors.border }]}
								onPress={onClose}
								disabled={loading}
							>
								<Text style={{ color: colors.text }}>Annuler</Text>
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
			{/* Paywall modal */}
			<SubscriptionPaywallModal
				isOpen={showPaywall}
				onClose={() => setShowPaywall(false)}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
		modal: {
			borderRadius: 16,
			padding: 24,
			elevation: 6,
			shadowOpacity: 0.15,
			shadowRadius: 12,
			shadowOffset: { width: 0, height: 4 },
		},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 18,
		textAlign: 'center',
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
		marginBottom: 12,
		fontSize: 16,
	},
	error: {
		marginBottom: 10,
		textAlign: 'center',
	},
	rowBtns: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	btn: {
		flex: 1,
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		marginHorizontal: 4,
	},
});

export default AddProprietaireModal;
