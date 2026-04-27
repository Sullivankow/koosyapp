// Composant React pour la création d'une facture
// - Gère les champs principaux (numéro, dates, entreprise, lignes, conditions, notes)
// - Calcule automatiquement les totaux (HT, TVA, TTC)
// - Permet d'ajouter / supprimer des lignes dynamiquement
// - Appelle onSubmit avec la facture complète lors de la validation

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {View,Text,TextInput,ScrollView,TouchableOpacity,StyleSheet,
	Modal,
	KeyboardAvoidingView,
	Dimensions,
	FlatList,
} from 'react-native';
import { Facture, LigneFacture, Entreprise, Bien, Proprietaire } from '../../models/models';
import { getBiens } from '../../utils/bienApi';
import PlusButton from '../../ui/PlusButton';
import { useTheme } from '../../contexts/ThemeContext';

interface AddFactureModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (facture: Partial<Facture> & { proprietaire?: number }) => void;
	entreprises: Entreprise[];
}

type LigneFactureForm = Omit<LigneFacture, 'id'>;

// Valeurs par défaut pour une ligne de facture
const defaultLigne: LigneFactureForm = {
	description: '',
	quantite: 1,
	prixUnitaireHT: 0,
	tauxTVA: 20,
	totalLigneHT: 0,
	totalLigneTTC: 0,
};

const getTodayDateForInput = (): string => {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, '0');
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const year = String(today.getFullYear());
	return `${day}/${month}/${year}`;
};

// Ajoute automatiquement les / pendant la saisie d'une date (JJ/MM/AAAA)
const formatDateInput = (value: string): string => {
	const cleaned = value.replace(/\D/g, '');
	let formatted = '';
	if (cleaned.length > 0) formatted = cleaned.slice(0, 2);
	if (cleaned.length > 2) formatted += '/' + cleaned.slice(2, 4);
	if (cleaned.length > 4) formatted += '/' + cleaned.slice(4, 8);
	return formatted;
};

type ThemeColors = ReturnType<typeof useTheme>['colors'];

interface ProprietairePickerProps {
	proprietaires: Proprietaire[];
	selectedProprioId?: number;
	onSelect: (id: number) => void;
	colors: ThemeColors;
}

// Sous-composant responsable de l'affichage et de la sélection du propriétaire
const ProprietairePicker: React.FC<ProprietairePickerProps> = ({
	proprietaires,
	selectedProprioId,
	onSelect,
	colors,
}) => {
	const [showModal, setShowModal] = useState(false);

	const selectedProprio = useMemo(
		() =>
			selectedProprioId !== undefined
				? proprietaires.find(p => p.id === selectedProprioId) ?? null
				: null,
		[proprietaires, selectedProprioId],
	);

	const label = selectedProprio
		? `${selectedProprio.nom}${selectedProprio.prenom ? ' ' + selectedProprio.prenom : ''}`
		: 'Sélectionner un propriétaire';

	if (!proprietaires.length) {
		return (
			<Text style={{ color: colors.error, fontWeight: 'bold' }}>
				Aucun propriétaire trouvé.
			</Text>
		);
	}

	return (
		<View style={{ width: '100%', marginBottom: 10 }}>
			<TouchableOpacity
				style={{
					paddingVertical: 12,
					paddingHorizontal: 16,
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 10,
					backgroundColor: colors.surface,
					width: '100%',
				}}
				onPress={() => setShowModal(true)}
			>
				<Text style={{ color: colors.text }}>{label}</Text>
			</TouchableOpacity>
			<Modal visible={showModal} transparent animationType="fade">
				<TouchableOpacity
					style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
					activeOpacity={1}
					onPress={() => setShowModal(false)}
				>
					<View
						style={{
							position: 'absolute',
							top: '30%',
							left: '5%',
							width: '90%',
							backgroundColor: colors.surface,
							borderRadius: 12,
							padding: 12,
							elevation: 8,
							shadowColor: '#000',
						}}
					>
						<FlatList
							data={proprietaires}
							keyExtractor={item => String(item.id)}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={{
										paddingVertical: 12,
										borderBottomWidth: 1,
										borderColor: colors.border,
									}}
									onPress={() => {
										onSelect(item.id);
										setShowModal(false);
									}}
								>
									<Text style={{ color: colors.text, fontSize: 16 }}>
										{item.nom}
										{item.prenom ? ' ' + item.prenom : ''}
									</Text>
								</TouchableOpacity>
							)}
							ListFooterComponent={
								<TouchableOpacity
									onPress={() => setShowModal(false)}
									style={{ padding: 12, alignItems: 'center' }}
								>
									<Text style={{ color: colors.error }}>Annuler</Text>
								</TouchableOpacity>
							}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

const AddFactureModal: React.FC<AddFactureModalProps> = ({ isOpen, onClose, onSubmit, entreprises }) => {
	// Champs principaux de la facture
	const [numero, setNumero] = useState('');
	const [dateEmission, setDateEmission] = useState(getTodayDateForInput());
	const [dateEcheance, setDateEcheance] = useState('');
	const [entreprise, setEntreprise] = useState<Entreprise | null>(null);

	// Lignes de la facture (tableau dynamique)
	const [lignes, setLignes] = useState<LigneFactureForm[]>([{ ...defaultLigne }]);

	// Champs optionnels
	const [conditionsPaiement, setConditionsPaiement] = useState('');
	const [notes, setNotes] = useState('');
	const [lieuPrestation, setLieuPrestation] = useState('');

	// Gestion des erreurs
	const [error, setError] = useState('');

	// Propriétaires liés aux biens
	const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
	const [selectedProprioId, setSelectedProprioId] = useState<number | undefined>(undefined);

	const { colors } = useTheme();

	// Formate la date d'échéance à la frappe pour conserver un format lisible.
	const handleDateEcheanceChange = (value: string) => {
		setDateEcheance(formatDateInput(value));
	};

	// Sélection automatique de la première entreprise si disponible
	useEffect(() => {
		if (isOpen && entreprises.length > 0) {
			setEntreprise(entreprises[0]);
		}
	}, [isOpen, entreprises]);

	useEffect(() => {
		if (isOpen) {
			setDateEmission(getTodayDateForInput());
		}
	}, [isOpen]);

	// Chargement des propriétaires liés à un bien à l'ouverture
	useEffect(() => {
		if (!isOpen) return;
		getBiens()
			.then((biensList: Bien[]) => {
				// Extraire les propriétaires uniques des biens
				const propriosMap: { [id: number]: Proprietaire } = {};
				biensList.forEach((bien: any) => {
					const proprio = bien.proprietaire || bien.proprio;
					if (proprio && proprio.id) {
						propriosMap[proprio.id] = proprio;
					}
				});
				const propriosArr = Object.values(propriosMap);
				setProprietaires(propriosArr);
				if (propriosArr.length > 0) {
					setSelectedProprioId(propriosArr[0].id);
				}
			})
			.catch(() => setProprietaires([]));
	}, [isOpen]);

	// Calcul automatique des totaux pour une ligne
	const calcLigne = useCallback(
		(ligne: LigneFactureForm): LigneFactureForm => {
			const totalHT = Number(ligne.quantite) * Number(ligne.prixUnitaireHT);
			const totalTTC = totalHT * (1 + Number(ligne.tauxTVA) / 100);
			return { ...ligne, totalLigneHT: totalHT, totalLigneTTC: totalTTC };
		},
		[],
	);

	// Met à jour une ligne (champ modifié)
	const handleLigneChange = (idx: number, field: keyof LigneFactureForm, value: any) => {
		setLignes(prev =>
			prev.map((l, i) => (i === idx ? calcLigne({ ...l, [field]: value }) : l)),
		);
	};

	// Ajoute une nouvelle ligne
	const addLigne = () => setLignes(prev => [...prev, { ...defaultLigne }]);

	// Supprime une ligne (si plus d'une)
	const removeLigne = (idx: number) =>
		setLignes(prev => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

	// Calcul des totaux globaux (mémoïsés)
	const { montantHT, montantTVA, montantTTC } = useMemo(() => {
		const totalHT = lignes.reduce((sum, l) => sum + (l.totalLigneHT ?? 0), 0);
		const totalTVA = lignes.reduce(
			(sum, l) => sum + ((l.totalLigneHT ?? 0) * (l.tauxTVA ?? 0)) / 100,
			0,
		);
		return {
			montantHT: totalHT,
			montantTVA: totalTVA,
			montantTTC: totalHT + totalTVA,
		};
	}, [lignes]);

	// Validation et envoi de la facture
	const handleSubmit = () => {
		if (!entreprise) {
			setError("Aucune entreprise disponible");
			return;
		}
		if (!selectedProprioId) {
			setError('Veuillez sélectionner un propriétaire');
			return;
		}
		setError('');
		onSubmit({
			numero,
			dateEmission,
			dateEcheance,
			entreprise,
			lignes: lignes as any,
			montantHT,
			montantTVA,
			montantTTC,
			conditionsPaiement,
			notes,
			lieuPrestation,
			statut: 'brouillon',
			proprietaire: selectedProprioId,
		});
		onClose();
		// Reset du formulaire
		setNumero('');
		setDateEmission(getTodayDateForInput());
		setDateEcheance('');
		setLignes([{ ...defaultLigne }]);
		setConditionsPaiement('');
		setNotes('');
		setLieuPrestation('');
		setSelectedProprioId(undefined);
	};

	// Si la modale n'est pas ouverte, ne rien afficher
	if (!isOpen) return null;

	return (
		<Modal visible={isOpen} animationType="slide" transparent>
			<View style={styles.modalOverlayAdd}>
				<KeyboardAvoidingView
					behavior="padding"
					style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
				>
					<View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
						<ScrollView
							style={{ maxHeight: 500, width: '100%' }}
							contentContainerStyle={{ alignItems: 'flex-start', paddingBottom: 30 }}
							keyboardShouldPersistTaps="handled"
							horizontal={false}
						>
							<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>
								Créer une facture
							</Text>
							{/* Affichage de l'entreprise sélectionnée */}
							<Text style={[styles.label, { color: colors.text }]}>Entreprise</Text>
							<View
								style={{
									width: '100%',
									marginBottom: 10,
									paddingVertical: 8,
									paddingHorizontal: 12,
									borderWidth: 1,
									borderColor: colors.border,
									borderRadius: 10,
									backgroundColor: colors.surface,
								}}
							>
								{entreprise ? (
									<Text style={{ color: colors.text, fontWeight: 'bold' }}>{entreprise.nom}</Text>
								) : (
									<Text style={{ color: colors.error, fontWeight: 'bold' }}>
										Aucune entreprise trouvée.
									</Text>
								)}
							</View>
							{/* Sélection du propriétaire */}
							<Text style={[styles.label, { color: colors.text }]}>Propriétaire</Text>
							<ProprietairePicker
								proprietaires={proprietaires}
								selectedProprioId={selectedProprioId}
								onSelect={setSelectedProprioId}
								colors={colors}
							/>
							{/* Numéro de facture (optionnel) */}
							<Text style={[styles.label, { color: colors.text }]}>Numéro</Text>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
								]}
								value={numero}
								onChangeText={setNumero}
								placeholder="Numéro de la facture (optionnel)"
								placeholderTextColor={colors.textSecondary}
								keyboardType="numeric"
							/>
							{/* Dates d'émission et d'échéance */}
							<Text style={[styles.label, { color: colors.text }]}>Date d'émission</Text>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
								]}
								value={dateEmission}
								onChangeText={setDateEmission}
								placeholder="JJ/MM/AAAA"
								placeholderTextColor={colors.textSecondary}
								keyboardType="numeric"
							/>
							<Text style={[styles.label, { color: colors.text }]}>Date d'échéance</Text>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
								]}
								value={dateEcheance}
								onChangeText={handleDateEcheanceChange}
								placeholder="JJ/MM/AAAA"
								placeholderTextColor={colors.textSecondary}
								keyboardType="numeric"
							/>
							{/* Lignes de facture dynamiques */}
							<Text style={[styles.sectionTitle, { color: colors.text }]}>Articles</Text>
							{lignes.map((ligne, idx) => (
								<View
									key={idx}
									style={[
										styles.ligneBox,
										{
											borderColor: colors.border,
											backgroundColor: colors.surface,
											width: '100%',
											maxWidth: 500,
										},
									]}
								>
									<Text style={[styles.label, { color: colors.text }]}>Description</Text>
									<TextInput
										style={[
											styles.input,
											{
												color: colors.text,
												backgroundColor: colors.surface,
												borderColor: colors.border,
												width: '100%',
												minWidth: 0,
												maxWidth: '100%',
											},
										]}
										placeholder="Ex : Peinture chambre, Pose parquet..."
										placeholderTextColor={colors.textSecondary}
										value={ligne.description}
										onChangeText={v => handleLigneChange(idx, 'description', v)}
									/>
									<Text style={[styles.label, { color: colors.text }]}>Quantité</Text>
									<TextInput
										style={[
											styles.input,
											{
												color: colors.text,
												backgroundColor: colors.surface,
												borderColor: colors.border,
												width: '100%',
												minWidth: 0,
												maxWidth: '100%',
											},
										]}
										placeholder="Ex : 2, 5, 1"
										placeholderTextColor={colors.textSecondary}
										keyboardType="numeric"
										value={String(ligne.quantite)}
										onChangeText={v => handleLigneChange(idx, 'quantite', Number(v))}
									/>
									<Text style={[styles.label, { color: colors.text }]}>Prix unitaire HT (€)</Text>
									<TextInput
										style={[
											styles.input,
											{
												color: colors.text,
												backgroundColor: colors.surface,
												borderColor: colors.border,
												width: '100%',
												minWidth: 0,
												maxWidth: '100%',
											},
										]}
										placeholder="Ex : 120"
										placeholderTextColor={colors.textSecondary}
										keyboardType="numeric"
										value={String(ligne.prixUnitaireHT)}
										onChangeText={v => handleLigneChange(idx, 'prixUnitaireHT', Number(v))}
									/>
									<Text style={[styles.label, { color: colors.text }]}>TVA (%)</Text>
									<TextInput
										style={[
											styles.input,
											{
												color: colors.text,
												backgroundColor: colors.surface,
												borderColor: colors.border,
												width: '100%',
												minWidth: 0,
												maxWidth: '100%',
											},
										]}
										placeholder="Ex : 20"
										placeholderTextColor={colors.textSecondary}
										keyboardType="numeric"
										value={String(ligne.tauxTVA)}
										onChangeText={v => handleLigneChange(idx, 'tauxTVA', Number(v))}
									/>
									{/* Totaux de la ligne */}
									<Text style={{ color: colors.text }}>
										Total HT: {(ligne.totalLigneHT ?? 0).toFixed(2)} €
									</Text>
									<Text style={{ color: colors.text }}>
										Total TTC: {(ligne.totalLigneTTC ?? 0).toFixed(2)} €
									</Text>
									{/* Bouton pour supprimer la ligne */}
									<TouchableOpacity
										onPress={() => removeLigne(idx)}
										disabled={lignes.length === 1}
										style={[styles.removeBtn, { backgroundColor: colors.error }]}
									>
										<Text style={{ color: '#fff' }}>Supprimer</Text>
									</TouchableOpacity>
								</View>
							))}
							{/* Bouton pour ajouter une ligne (centré horizontalement) */}
							<View style={{ alignItems: 'center', marginVertical: 8, width: '100%' }}>
								<PlusButton
									onPress={addLigne}
									backgroundColor={colors.primary}
									iconColor={colors.surface}
									style={{ position: 'relative', right: 0, bottom: 0 }}
								/>
							</View>
							{/* Récapitulatif des totaux */}
							<Text style={[styles.summary, { color: colors.text }]}>
								Total HT: {montantHT.toFixed(2)} € | TVA: {montantTVA.toFixed(2)} € | TTC: {montantTTC.toFixed(2)} €
							</Text>
							{/* Lieu de prestation */}
							<Text style={[styles.label, { color: colors.text }]}>Lieu de prestation</Text>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
								]}
								value={lieuPrestation}
								onChangeText={setLieuPrestation}
								placeholder="Ex : 12 rue de Paris, 75001 Paris"
								placeholderTextColor={colors.textSecondary}
							/>
							{/* Conditions de paiement et notes */}
							<Text style={[styles.label, { color: colors.text }]}>Conditions de paiement</Text>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
								]}
								value={conditionsPaiement}
								onChangeText={setConditionsPaiement}
								placeholder="Conditions de paiement"
								placeholderTextColor={colors.textSecondary}
								multiline={true}
							/>
							<Text style={[styles.label, { color: colors.text }]}>Notes</Text>
							<TextInput
								style={[
									styles.input,
									{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
								]}
								value={notes}
								onChangeText={setNotes}
								placeholder="Notes"
								placeholderTextColor={colors.textSecondary}
								multiline={true}
							/>
							{/* Affichage des erreurs éventuelles */}
							{error ? (
								<Text style={{ color: colors.error, marginTop: 10, textAlign: 'center' }}>{error}</Text>
							) : null}
							{/* Boutons d'action */}
							<View style={styles.btnRow}>
								<TouchableOpacity
									onPress={handleSubmit}
									style={[styles.submitBtn, { backgroundColor: colors.primary }]}
								>
									<Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>Créer</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={onClose}
									style={[styles.cancelBtn, { backgroundColor: colors.border }]}
								>
									<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Annuler</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
};

export default AddFactureModal;

// Styles pour la modale et les champs
const SCREEN_WIDTH = Dimensions.get('window').width;
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
	},
	label: { marginTop: 10, marginBottom: 2, fontWeight: 'bold' },
	sectionTitle: { marginTop: 18, marginBottom: 6, fontWeight: 'bold', fontSize: 16 },
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
	ligneBox: { borderWidth: 1, borderRadius: 10, padding: 8, marginBottom: 8 },
	addBtn: { padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
	removeBtn: { padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 6 },
	summary: { fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
	submitBtn: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 8 },
	cancelBtn: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
});
