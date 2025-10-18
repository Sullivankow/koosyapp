import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
const SCREEN_WIDTH = Dimensions.get('window').width;
import { getBiens, createTache } from '../utils/api';
	import { useTache } from '../contexts/TacheContext';

// Enum des statuts
const TACHE_STATUTS = [
	{ label: 'À faire', value: 'à faire' },
	{ label: 'Terminée', value: 'terminée' },
];

interface AddTachesModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	bienId?: number; // optionnel, à passer si besoin
}

const AddTachesModal: React.FC<AddTachesModalProps> = ({ visible, onClose, onSuccess, bienId }) => {
	const { colors } = useTheme();
	const [form, setForm] = useState({
		titre: '',
		description: '',
		statut: 'à faire',
		dateEcheance: '',
		bienId: bienId || '',
	});
	const [loading, setLoading] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');
	const [biens, setBiens] = useState<any[]>([]);

	useEffect(() => {
		// Récupérer la liste des biens à l’ouverture de la modal
		if (visible) {
			getBiens().then(data => setBiens(data)).catch(() => setBiens([]));
		}
	}, [visible]);

	
	const { signalTacheAdded } = useTache();
	const normalizeDate = (d: string) => {
		if (!d) return undefined;
		// accept YYYY-MM-DD -> convert to DD/MM/YYYY
		const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(d);
		if (isoMatch) {
			const [y, m, day] = d.split('-');
			return `${day}/${m}/${y}`;
		}
		// accept already DD/MM/YYYY
		if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
		// otherwise return as-is (backend will validate)
		return d;
	};

	const handleSubmit = async () => {
		setLoading(true);
		setSuccessMsg('');
		try {
			const bienIdNumber = Number(form.bienId);
			if (!bienIdNumber || isNaN(bienIdNumber)) {
				setSuccessMsg("Veuillez sélectionner un bien valide");
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
				setForm({ titre: '', description: '', statut: 'à faire', dateEcheance: '', bienId: bienId || '' });
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
				<KeyboardAvoidingView behavior="padding" style={{ width: '100%', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
						<View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
							<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Ajouter une tâche</Text>
							<TextInput style={[styles.input, { color: '#111' }]} placeholder="Titre" placeholderTextColor="#888" value={form.titre} onChangeText={v => setForm(f => ({ ...f, titre: v }))} />
							<TextInput style={[styles.input, { color: '#111' }]} placeholder="Description" placeholderTextColor="#888" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
							<TextInput style={[styles.input, { color: '#111' }]} placeholder="Date d'échéance (JJ/MM/AAAA)" placeholderTextColor="#888" value={form.dateEcheance} onChangeText={v => setForm(f => ({ ...f, dateEcheance: v }))} />
							<View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10 }}>
								<Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Statut</Text>
								{TACHE_STATUTS.map(opt => (
									<TouchableOpacity
										key={opt.value}
										style={{ padding: 8, borderRadius: 8, backgroundColor: form.statut === opt.value ? colors.primary : '#f5f5f5', marginBottom: 4 }}
										onPress={() => setForm(f => ({ ...f, statut: opt.value }))}
									>
										<Text style={{ color: form.statut === opt.value ? colors.surface : '#222', fontWeight: 'bold' }}>{opt.label}</Text>
									</TouchableOpacity>
								))}
							</View>
							<View style={{ width: SCREEN_WIDTH * 0.8, marginBottom: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: '#f9f9ff', padding: 8 }}>
								<Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>Sélectionner un bien</Text>
								<ScrollView style={{ maxHeight: 140 }}>
									{biens.length === 0 ? (
										<Text style={{ color: colors.error, textAlign: 'center', marginVertical: 12 }}>Aucun bien disponible</Text>
									) : (
										biens.map(bien => (
											<TouchableOpacity
												key={bien.id}
												style={{
													padding: 10,
													borderRadius: 8,
													backgroundColor: form.bienId === bien.id ? colors.primary : '#e6e6fa',
													marginBottom: 6,
													borderWidth: form.bienId === bien.id ? 2 : 0,
													borderColor: colors.primary,
												}}
												onPress={() => setForm(f => ({ ...f, bienId: bien.id }))}
											>
												<Text style={{ color: form.bienId === bien.id ? colors.surface : '#222', fontWeight: 'bold', fontSize: 15 }}>{bien.nom} ({bien.adresse})</Text>
											</TouchableOpacity>
										))
									)}
								</ScrollView>
								{!form.bienId && <Text style={{ color: colors.error, marginTop: 6, textAlign: 'center' }}>Veuillez sélectionner un bien</Text>}
							</View>
							<TouchableOpacity style={[styles.input, { backgroundColor: colors.primary, marginTop: 18, alignItems: 'center' }]} onPress={handleSubmit} disabled={loading || !form.bienId}>
								<Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
								<Text style={{ color: colors.error, textAlign: 'center' }}>Annuler</Text>
							</TouchableOpacity>
							{successMsg ? <Text style={{ color: colors.success, marginTop: 10, textAlign: 'center' }}>{successMsg}</Text> : null}
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
