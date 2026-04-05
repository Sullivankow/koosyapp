// Modale d'ajout d'une tâche liée à un bien
// - Permet de saisir titre, description, date d'échéance, statut
// - Permet de sélectionner un bien cible
// - Appelle createTache puis notifie le contexte des tâches

import React, { useState, useEffect, useCallback } from 'react';
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	KeyboardAvoidingView,
	ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getBiens, createTache } from '../../utils/api';
import { useTache } from '../../contexts/TacheContext';
import { Bien } from '../../models/models';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Enum des statuts possibles pour une tâche
const TACHE_STATUTS = [
	{ label: 'À faire', value: 'à faire' },
	{ label: 'Terminée', value: 'terminée' },
];

type TacheStatutValue = 'à faire' | 'terminée';

const getContrastTextColor = (hexColor: string) => {
	const sanitized = (hexColor || '').replace('#', '');
	if (sanitized.length !== 6) return '#FFFFFF';

	const r = parseInt(sanitized.slice(0, 2), 16);
	const g = parseInt(sanitized.slice(2, 4), 16);
	const b = parseInt(sanitized.slice(4, 6), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 170 ? '#1E242B' : '#FFFFFF';
};

// Structure d'état pour le formulaire de tâche
type TacheFormState = {
	titre: string;
	description: string;
	statut: TacheStatutValue;
	dateEcheance: string;
	bienId: number | '';
};

interface AddTachesModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	bienId?: number; // optionnel, à passer si besoin
}

// Valeurs initiales du formulaire, éventuellement pré-remplies avec un bien
const buildInitialForm = (bienId?: number): TacheFormState => ({
	titre: '',
	description: '',
	statut: 'à faire',
	dateEcheance: '',
	bienId: bienId ?? '',
});

// Normalise la date saisie pour la rendre cohérente côté backend
const normalizeDate = (d: string) => {
	if (!d) return undefined;
	// accepte YYYY-MM-DD -> convertit en DD/MM/YYYY
	const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(d);
	if (isoMatch) {
		const [y, m, day] = d.split('-');
		return `${day}/${m}/${y}`;
	}
	// accepte déjà DD/MM/YYYY
	if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
	// sinon renvoie tel quel (le backend validera)
	return d;
};

const AddTachesModal: React.FC<AddTachesModalProps> = ({ visible, onClose, onSuccess, bienId }) => {
	const { colors, isDarkMode } = useTheme();
	const activeStatusColor = colors.primary;
	const activeStatusTextColor = getContrastTextColor(activeStatusColor);
	const bienPickerBackground = isDarkMode ? colors.surface : '#f9f9ff';
	const bienOptionBackground = isDarkMode ? colors.background : '#e6e6fa';
	const bienOptionTextColor = isDarkMode ? colors.text : '#222';
	const { signalTacheAdded } = useTache();

	const [form, setForm] = useState<TacheFormState>(() => buildInitialForm(bienId));
	const [loading, setLoading] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');
	const [biens, setBiens] = useState<Bien[]>([]);

	// Charge la liste des biens à l'ouverture de la modale
	useEffect(() => {
		if (visible) {
			getBiens()
				.then(data => setBiens(data))
				.catch(() => setBiens([]));
		}
	}, [visible]);

	// Réinitialise le formulaire quand la modale s'ouvre ou que le bien par défaut change
	useEffect(() => {
		if (visible) {
			setForm(buildInitialForm(bienId));
		}
	}, [visible, bienId]);

	// Mise à jour générique d'un champ du formulaire
	const updateField = useCallback(
		(key: keyof TacheFormState, value: TacheFormState[keyof TacheFormState]) => {
			setForm(prev => ({ ...prev, [key]: value }));
		},
		[],
	);

	// Validation et envoi de la tâche au backend
	const handleSubmit = async () => {
		setLoading(true);
		setSuccessMsg('');
		try {
			const bienIdNumber = Number(form.bienId);
			if (!bienIdNumber || Number.isNaN(bienIdNumber)) {
				setSuccessMsg('Veuillez sélectionner un bien valide');
				setLoading(false);
				return;
			}

			const payload: any = {
				titre: form.titre,
				description: form.description || undefined,
				statut: form.statut,
				bienId: bienIdNumber,
			};

			const normalizedDate = normalizeDate(form.dateEcheance);
			if (normalizedDate) payload.dateEcheance = normalizedDate;

			await createTache(payload);
			signalTacheAdded();
			setSuccessMsg('Tâche ajoutée !');
			setTimeout(() => {
				setSuccessMsg('');
				setForm(buildInitialForm(bienId));
				setLoading(false);
				onClose();
				if (onSuccess) onSuccess();
			}, 1200);
		} catch (err) {
			setSuccessMsg("Erreur lors de l'ajout");
			setLoading(false);
		}
	};

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlayAdd}>
				<KeyboardAvoidingView
					behavior="padding"
					style={{ width: '100%', justifyContent: 'center', alignItems: 'center', flex: 1 }}
				>
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
						<View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
							<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>
								Ajouter une tâche
							</Text>
							<TextInput
								style={[styles.input, { color: '#111' }]}
								placeholder="Titre"
								placeholderTextColor="#888"
								value={form.titre}
								onChangeText={v => updateField('titre', v)}
							/>
							<TextInput
								style={[styles.input, { color: '#111' }]}
								placeholder="Description"
								placeholderTextColor="#888"
								value={form.description}
								onChangeText={v => updateField('description', v)}
								multiline
							/>
							<TextInput
								style={[styles.input, { color: '#111' }]}
								placeholder="Date d'échéance (JJ/MM/AAAA)"
								placeholderTextColor="#888"
								value={form.dateEcheance}
								onChangeText={v => updateField('dateEcheance', v)}
							/>
							<View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10 }}>
								<Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Statut</Text>
								{TACHE_STATUTS.map(opt => (
									<TouchableOpacity
										key={opt.value}
										activeOpacity={0.8}
										style={{
											padding: 8,
											borderRadius: 8,
											backgroundColor: form.statut === opt.value ? activeStatusColor : colors.surface,
											marginBottom: 4,
											borderWidth: form.statut === opt.value ? 2 : 1,
											borderColor: form.statut === opt.value ? activeStatusColor : colors.border,
										}}
										onPress={() => updateField('statut', opt.value as TacheStatutValue)}
									>
										<Text style={{ color: form.statut === opt.value ? activeStatusTextColor : colors.text, fontWeight: 'bold' }}>
											{opt.label}
										</Text>
									</TouchableOpacity>
								))}
							</View>
							<View
								style={{
									width: SCREEN_WIDTH * 0.8,
									marginBottom: 10,
									borderWidth: 1,
									borderColor: colors.primary,
									borderRadius: 10,
									backgroundColor: bienPickerBackground,
									padding: 8,
								}}
							>
								<Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
									Sélectionner un bien
								</Text>
								<ScrollView style={{ maxHeight: 140 }}>
									{biens.length === 0 ? (
										<Text style={{ color: colors.error, textAlign: 'center', marginVertical: 12 }}>
											Aucun bien disponible
										</Text>
									) : (
										biens.map(bien => (
											<TouchableOpacity
												key={bien.id}
												style={{
													padding: 10,
													borderRadius: 8,
														backgroundColor: form.bienId === bien.id ? colors.primary : bienOptionBackground,
													marginBottom: 6,
													borderWidth: form.bienId === bien.id ? 2 : 0,
													borderColor: colors.primary,
												}}
												onPress={() => updateField('bienId', bien.id)}
											>
													<Text style={{ color: form.bienId === bien.id ? colors.surface : bienOptionTextColor, fontWeight: 'bold', fontSize: 15 }}>
													{bien.nom} ({bien.adresse})
												</Text>
											</TouchableOpacity>
										))
									)}
								</ScrollView>
								{!form.bienId && (
									<Text style={{ color: colors.error, marginTop: 6, textAlign: 'center' }}>
										Veuillez sélectionner un bien
									</Text>
								)}
							</View>
							<TouchableOpacity
								style={[styles.input, { backgroundColor: colors.primary, marginTop: 18, alignItems: 'center' }]}
								onPress={handleSubmit}
								disabled={loading || !form.bienId}
							>
								<Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>
									{loading ? 'Enregistrement...' : 'Enregistrer'}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
								<Text style={{ color: colors.error, textAlign: 'center' }}>Annuler</Text>
							</TouchableOpacity>
							{successMsg ? (
								<Text style={{ color: colors.success, marginTop: 10, textAlign: 'center' }}>{successMsg}</Text>
							) : null}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlayAdd: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContentAdd: {
		width: SCREEN_WIDTH * 0.9,
		borderRadius: 18,
		padding: 22,
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 12,
		alignItems: 'center',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginBottom: 10,
		fontSize: 15,
		backgroundColor: '#fff',
		width: SCREEN_WIDTH * 0.8,
	},
});

export default AddTachesModal;
