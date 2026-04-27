// Composant de modale pour créer un devis
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Dimensions, FlatList } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { CreateDevisPayload, LigneDevis, Entreprise, Bien } from '../../models/models';
import { getBiens } from '../../utils/bienApi';
import { apiFetchMyEntreprise } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import PlusButton from '../../ui/PlusButton';

// Propriétés attendues par le composant AddDevisModal
interface AddDevisModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateDevisPayload) => void;
	entreprises: Entreprise[];
}

dayjs.locale('fr');
// Représentation minimale d'un propriétaire utilisée dans cette modale
type Proprietaire = {
	id: number;
	nom: string;
	prenom?: string | null;
};
// Type local pour l'édition dans l'UI, différent du modèle backend.
type LigneDevisForm = {
	description: string;
	quantite: number;
	prixUnitaireHT: number;
	tauxTVA: number;
	totalLigneHT: number;
	totalLigneTTC: number;
};
// Modèle par défaut pour une ligne de devis
const defaultLigne: LigneDevisForm = {
	description: '',
	quantite: 1,
	prixUnitaireHT: 0,
	tauxTVA: 20,
	totalLigneHT: 0,
	totalLigneTTC: 0,
};

// Composant principal de création de devis
const AddDevisModal: React.FC<AddDevisModalProps> = ({ isOpen, onClose, onSubmit }) => {
	// Champs principaux du devis
	const [numero, setNumero] = useState('');
	const [dateValidite, setDateValidite] = useState('');
	const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
	// Propriétaires potentiels (déduits des biens)
	const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
	const [selectedProprioId, setSelectedProprioId] = useState<string | undefined>(undefined);
	const [showProprioModal, setShowProprioModal] = useState(false);
	// Lignes du devis (articles / prestations)
	const [lignes, setLignes] = useState<LigneDevisForm[]>([{ ...defaultLigne }]);
	// Champs texte complémentaires
	const [conditions, setConditions] = useState('');
	const [notes, setNotes] = useState('');
	const [lieuPrestation, setLieuPrestation] = useState('');
	const [error, setError] = useState('');
	const { colors } = useTheme();

	// Au moment où la modale s'ouvre, charger l'entreprise et les propriétaires
	useEffect(() => {
		if (!isOpen) return;

		apiFetchMyEntreprise()
			.then(setEntreprise)
			.catch(() => setEntreprise(null));

		getBiens()
			.then((biensList: Bien[]) => {
				const propriosMap: { [id: number]: Proprietaire } = {};
				biensList.forEach((bien: any) => {
					const proprio = bien.proprietaire || bien.proprio;
					if (proprio && proprio.id) {
						propriosMap[proprio.id] = {
							id: proprio.id,
							nom: proprio.nom,
							prenom: proprio.prenom ?? null,
						};
					}
				});
				const propriosArr = Object.values(propriosMap);
				setProprietaires(propriosArr);
				if (propriosArr.length > 0) {
					setSelectedProprioId(String(propriosArr[0].id));
				}
			})
			.catch(() => {
				setProprietaires([]);
				setSelectedProprioId(undefined);
			});
	}, [isOpen]);

	// Calculs automatiques sur une ligne de devis (HT / TTC)
	const calcLigne = useCallback(
		(ligne: LigneDevisForm): LigneDevisForm => {
			const totalHT = Number(ligne.quantite) * Number(ligne.prixUnitaireHT);
			const totalTTC = totalHT * (1 + Number(ligne.tauxTVA) / 100);
			return { ...ligne, totalLigneHT: totalHT, totalLigneTTC: totalTTC };
		},
		[],
	);

	const handleLigneChange = useCallback(
		(idx: number, field: keyof LigneDevisForm, value: any) => {
			setLignes(prev =>
				prev.map((l, i) => (i === idx ? calcLigne({ ...l, [field]: value }) : l)),
			);
		},
		[calcLigne],
	);

	const addLigne = () => setLignes(prev => [...prev, { ...defaultLigne }]);
	const removeLigne = (idx: number) =>
		setLignes(prev => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

	// Calculs totaux mémoïsés pour l'ensemble du devis
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

	// Propriétaire actuellement sélectionné (objet complet)
	const selectedProprio = useMemo(
		() =>
			selectedProprioId
				? proprietaires.find(p => String(p.id) === selectedProprioId) ?? null
				: null,
		[proprietaires, selectedProprioId],
	);

	// Formate une date potentiellement au format ISO en JJ/MM/AAAA pour l'input
	const formatDateForInput = useCallback((value: string) => {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).isValid()) {
			return dayjs(value).format('DD/MM/YYYY');
		}
		return value;
	}, []);

	// Formate la date automatiquement avec des / lors de la saisie
	const formatDateInput = (value: string) => {
		// On enlève tout sauf les chiffres
		const cleaned = value.replace(/\D/g, '');
		let formatted = '';
		if (cleaned.length > 0) formatted = cleaned.slice(0, 2);
		if (cleaned.length > 2) formatted += '/' + cleaned.slice(2, 4);
		if (cleaned.length > 4) formatted += '/' + cleaned.slice(4, 8);
		return formatted;
	};

	// Gère la saisie de la date de validité avec formatage automatique
	const handleDateChange = (val: string) => {
		const formatted = formatDateInput(val);
		setDateValidite(formatted);
	};

	// Soumission du formulaire : validation des champs, construction du payload et appel du callback parent
	const handleSubmit = () => {
		if (!entreprise) {
			setError("Aucune entreprise disponible");
			return;
		}
		if (!selectedProprioId) {
			setError("Veuillez sélectionner un propriétaire");
			return;
		}
		setError('');
		// Conversion date pour le backend (YYYY-MM-DD)
		let dateBackend = '';
		if (dateValidite && dateValidite.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
			// Format JJ/MM/AAAA
			const [jour, mois, annee] = dateValidite.split('/');
			dateBackend = `${annee}-${mois}-${jour}`;
		} else if (dateValidite && dateValidite.match(/^\d{4}-\d{2}-\d{2}$/)) {
			dateBackend = dateValidite;
		} else if (dateValidite) {
			dateBackend = dayjs(dateValidite).isValid() ? dayjs(dateValidite).format('YYYY-MM-DD') : '';
		}
		const payload: CreateDevisPayload = {
			numero,
			dateValidite: dateBackend || undefined,
			entreprise,
			lignes: lignes.map((ligne) => ({
				id: 0,
				description: ligne.description,
				quantite: ligne.quantite,
				prixUnitaireHT: ligne.prixUnitaireHT,
				tauxTVA: ligne.tauxTVA,
				totalLigneHT: ligne.totalLigneHT,
				totalLigneTTC: ligne.totalLigneTTC,
			})),
			montantHT,
			montantTVA,
			montantTTC,
			conditions,
			notes,
			lieuPrestation,
			proprietaire: Number(selectedProprioId),
		};
		onSubmit(payload);
		onClose();
		// Optionnel: reset form
		setNumero(''); setDateValidite(''); setLignes([{ ...defaultLigne }]); setConditions(''); setNotes(''); setLieuPrestation(''); setSelectedProprioId(undefined);
	};

	if (!isOpen) return null;

	return (
		<Modal visible={isOpen} animationType="slide" transparent>
			<View style={styles.modalOverlayAdd}>
				<KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
					<View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
						<ScrollView
							style={{ maxHeight: 500, width: '100%' }}
							contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}
							keyboardShouldPersistTaps="handled"
							horizontal={false}
						>
							<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Créer un devis</Text>
							{/* Bloc affichant l'entreprise courante */}
							<Text style={[styles.label, { color: colors.text }]}>Entreprise</Text>
							<View style={{ width: '100%', marginBottom: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface }}>
								{entreprise ? (
									<Text style={{ color: colors.text, fontWeight: 'bold' }}>{entreprise.nom}</Text>
								) : (
									<Text style={{ color: colors.error, fontWeight: 'bold' }}>Aucune entreprise trouvée. Veuillez vérifier vos paramètres ou créer une entreprise dans l'application.</Text>
								)}
							</View>
							{/* Sélecteur de propriétaire lié au devis */}
							<Text style={[styles.label, { color: colors.text }]}>Propriétaire</Text>
							<View style={{ width: '100%', marginBottom: 10 }}>
								{proprietaires.length > 0 ? (
									<>
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
											onPress={() => setShowProprioModal(true)}
										>
											<Text style={{ color: colors.text }}>
												{selectedProprio
													? `${selectedProprio.nom}${selectedProprio.prenom ? ' ' + selectedProprio.prenom : ''}`
													: 'Sélectionner un propriétaire'}
											</Text>
										</TouchableOpacity>
										<Modal visible={showProprioModal} transparent animationType="fade">
											<TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => setShowProprioModal(false)}>
												<View style={{
													position: 'absolute',
													top: '30%',
													left: '5%',
													width: '90%',
													backgroundColor: colors.surface,
													borderRadius: 12,
													padding: 12,
													elevation: 8,
													shadowColor: '#000',
												}}>
													<FlatList
														data={proprietaires}
														keyExtractor={item => String(item.id)}
														renderItem={({ item }) => (
															<TouchableOpacity
																style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}
																onPress={() => {
																	setSelectedProprioId(String(item.id));
																	setShowProprioModal(false);
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
																	onPress={() => setShowProprioModal(false)}
																	style={{ padding: 12, alignItems: 'center' }}
																>
																	<Text style={{ color: colors.error }}>Annuler</Text>
																</TouchableOpacity>
															}
													/>
												</View>
											</TouchableOpacity>
										</Modal>
									</>
								) : (
									<Text style={{ color: colors.error }}>Aucun propriétaire trouvé dans les biens.</Text>
								)}
							</View>
							{/* Champs principaux du devis */}
							<Text style={[styles.label, { color: colors.text }]}>Numéro</Text>
							<TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={numero} onChangeText={setNumero} placeholder="Numéro du devis (optionnel)" placeholderTextColor={colors.textSecondary} keyboardType="numeric" />
							
							<Text style={[styles.label, { color: colors.text }]}>Date de validité</Text>
							<TextInput
								style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
								value={formatDateForInput(dateValidite)}
								onChangeText={handleDateChange}
								placeholder="JJ/MM/AAAA"
								placeholderTextColor={colors.textSecondary}
								keyboardType="numeric"
							/>

							<Text style={[styles.label, { color: colors.text }]}>Lieu de prestation</Text>
							<TextInput
								style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
								value={lieuPrestation}
								onChangeText={setLieuPrestation}
								placeholder="Ex : 12 rue de Paris, 75001 Paris"
								placeholderTextColor={colors.textSecondary}
							/>

							{/* Lignes d'articles composant le devis */}
							<Text style={[styles.sectionTitle, { color: colors.text }]}>Articles</Text>
							{lignes.map((ligne, idx) => (
								<View key={idx} style={[styles.ligneBox, { borderColor: colors.border, backgroundColor: colors.surface, width: '100%', maxWidth: 500 }]}> 
									<Text style={[styles.label, { color: colors.text }]}>Description</Text>
									<TextInput
										style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
										placeholder="Ex : Peinture chambre, Pose parquet..."
										placeholderTextColor={colors.textSecondary}
										value={ligne.description}
										onChangeText={v => handleLigneChange(idx, 'description', v)}
									/> 
									<Text style={[styles.label, { color: colors.text }]}>Quantité</Text>
									<TextInput
										style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
										placeholder="Ex : 2, 5, 1"
										placeholderTextColor={colors.textSecondary}
										keyboardType="numeric"
										value={String(ligne.quantite)}
										onChangeText={v => handleLigneChange(idx, 'quantite', Number(v))}
									/> 
									<Text style={[styles.label, { color: colors.text }]}>Prix unitaire HT (€)</Text>
									<TextInput
										style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
										placeholder="Ex : 120"
										placeholderTextColor={colors.textSecondary}
										keyboardType="numeric"
										value={String(ligne.prixUnitaireHT)}
										onChangeText={v => handleLigneChange(idx, 'prixUnitaireHT', Number(v))}
									/> 
									<Text style={[styles.label, { color: colors.text }]}>TVA (%)</Text>
									<TextInput
										style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, width: '100%', minWidth: 0, maxWidth: '100%' }]}
										placeholder="Ex : 20"
										placeholderTextColor={colors.textSecondary}
										keyboardType="numeric"
										value={String(ligne.tauxTVA)}
										onChangeText={v => handleLigneChange(idx, 'tauxTVA', Number(v))}
									/> 
									<Text style={{ color: colors.text }}>Total HT: {(ligne.totalLigneHT ?? 0).toFixed(2)} €</Text>
									<Text style={{ color: colors.text }}>Total TTC: {(ligne.totalLigneTTC ?? 0).toFixed(2)} €</Text>
									<TouchableOpacity onPress={() => removeLigne(idx)} disabled={lignes.length === 1} style={[styles.removeBtn, { backgroundColor: colors.error }]}> 
										<Text style={{ color: '#fff' }}>Supprimer</Text>
									</TouchableOpacity>
								</View>
							))}
							<View style={{ alignItems: 'center', marginVertical: 8 }}>
								<PlusButton onPress={addLigne} backgroundColor={colors.primary} iconColor={colors.surface} style={{ position: 'relative', right: 0, bottom: 0 }} />
							</View>
							{/* Récapitulatif des montants du devis */}
							<Text style={[styles.summary, { color: colors.text }]}>Total HT: {montantHT.toFixed(2)} € | TVA: {montantTVA.toFixed(2)} € | TTC: {montantTTC.toFixed(2)} €</Text>
							{/* Zones de texte complémentaires */}
							<Text style={[styles.label, { color: colors.text }]}>Conditions</Text>
							<TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={conditions} onChangeText={setConditions} placeholder="Conditions" placeholderTextColor={colors.textSecondary} multiline={true} />
							<Text style={[styles.label, { color: colors.text }]}>Notes</Text>
							<TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={colors.textSecondary} multiline={true} />
							{error ? <Text style={{ color: colors.error, marginTop: 10, textAlign: 'center' }}>{error}</Text> : null}
							{/* Boutons d'action de la modale */}
							<View style={styles.btnRow}>
								<TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: colors.primary }]}> 
									<Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>Créer</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.border }]}> 
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

export default AddDevisModal;

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
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 12,
		alignItems: 'center',
	},
	label: { fontWeight: 'bold', marginTop: 8, alignSelf: 'flex-start' },
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
	sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
	ligneBox: { borderWidth: 1, borderRadius: 10, padding: 8, marginBottom: 8 },
	removeBtn: { padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 6 },
	summary: { fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
	submitBtn: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 8 },
	cancelBtn: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
});


