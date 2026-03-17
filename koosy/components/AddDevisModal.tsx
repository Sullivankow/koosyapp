// import fusionné plus bas
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Devis, LigneDevis, Entreprise } from '../models/models';
import { apiFetchMyEntreprise } from '../utils/api';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';



interface AddDevisModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (devis: Partial<Devis>) => void;
	entreprises: Entreprise[];
}

dayjs.locale('fr');
const defaultLigne: Omit<LigneDevis, 'id'> = {
	description: '',
	quantite: 1,
	prixUnitaireHT: 0,
	tva: 20,
	totalLigneHT: 0,
	totalLigneTTC: 0,
};

export const AddDevisModal: React.FC<AddDevisModalProps> = ({ isOpen, onClose, onSubmit }) => {
	const [numero, setNumero] = useState('');
	const [dateValidite, setDateValidite] = useState('');
	const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
	useEffect(() => {
		if (isOpen) {
			apiFetchMyEntreprise()
				.then(setEntreprise)
				.catch(() => setEntreprise(null));
		}
	}, [isOpen]);
	type LigneDevisForm = Omit<LigneDevis, 'id' | 'devis'>;
	const [lignes, setLignes] = useState<LigneDevisForm[]>([{ ...defaultLigne }]);
	const [conditions, setConditions] = useState('');
	const [notes, setNotes] = useState('');
	const [error, setError] = useState('');
	const { colors } = useTheme();
	const SCREEN_WIDTH = Dimensions.get('window').width;

	// Calculs automatiques
	const calcLigne = (ligne: LigneDevisForm): LigneDevisForm => {
		const totalHT = Number(ligne.quantite) * Number(ligne.prixUnitaireHT);
		const totalTTC = totalHT * (1 + Number(ligne.tva) / 100);
		return { ...ligne, totalLigneHT: totalHT, totalLigneTTC: totalTTC };
	};

	const handleLigneChange = (idx: number, field: keyof LigneDevisForm, value: any) => {
		const newLignes = lignes.map((l, i) =>
			i === idx ? calcLigne({ ...l, [field]: value }) : l
		);
		setLignes(newLignes);
	};

	const addLigne = () => setLignes([...lignes, { ...defaultLigne }]);
	const removeLigne = (idx: number) => setLignes(lignes.length > 1 ? lignes.filter((_, i) => i !== idx) : lignes);

	// Calculs totaux
	const montantHT = lignes.reduce((sum, l) => sum + (l.totalLigneHT ?? 0), 0);
	const montantTVA = lignes.reduce((sum, l) => sum + ((l.totalLigneHT ?? 0) * (l.tva ?? 0)) / 100, 0);
	const montantTTC = montantHT + montantTVA;

	const handleSubmit = () => {
		if (!entreprise) {
			setError("Aucune entreprise disponible");
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
		onSubmit({
			numero,
			dateValidite: dateBackend || undefined,
			entreprise,
			lignes: lignes as any, // le backend générera l'id
			montantHT,
			montantTVA,
			montantTTC,
			conditions,
			notes,
		});
		onClose();
		// Optionnel: reset form
		setNumero(''); setDateValidite(''); setLignes([{ ...defaultLigne }]); setConditions(''); setNotes('');
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
							       <Text style={[styles.label, { color: colors.text }]}>Entreprise</Text>
								<View style={{ width: '100%', marginBottom: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface }}>
									{entreprise ? (
										<Text style={{ color: colors.text, fontWeight: 'bold' }}>{entreprise.nom}</Text>
									) : (
										<Text style={{ color: colors.error, fontWeight: 'bold' }}>Aucune entreprise trouvée. Veuillez vérifier vos paramètres ou créer une entreprise dans l'application.</Text>
									)}
								</View>
							       <Text style={[styles.label, { color: colors.text }]}>Numéro</Text>
							       <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={numero} onChangeText={setNumero} placeholder="Numéro du devis (optionnel)" placeholderTextColor={colors.textSecondary} />

							       <Text style={[styles.label, { color: colors.text }]}>Date de validité</Text>
							       <TextInput
								       style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
								       value={(() => {
									       // Affiche JJ/MM/AAAA si la date est au format backend
									       if (/^\d{4}-\d{2}-\d{2}$/.test(dateValidite) && dayjs(dateValidite).isValid()) {
										       return dayjs(dateValidite).format('DD/MM/YYYY');
									       }
									       return dateValidite;
								       })()}
								       onChangeText={val => {
									       // Autorise saisie JJ/MM/AAAA ou YYYY-MM-DD
									       let v = val;
									       if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
										       setDateValidite(val);
									       } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
										       setDateValidite(dayjs(val).format('DD/MM/YYYY'));
									       } else {
										       setDateValidite(val);
									       }
								       }}
								       placeholder="JJ/MM/AAAA"
								       placeholderTextColor={colors.textSecondary}
								       keyboardType="default"
							       />
							       {/* Statut supprimé */}
							       {/* Entreprise sélectionnée automatiquement, champ masqué */}
							       <Text style={[styles.sectionTitle, { color: colors.text }]}>Lignes du devis</Text>
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
										       value={String(ligne.tva)}
										       onChangeText={v => handleLigneChange(idx, 'tva', Number(v))}
									       /> 
									       <Text style={{ color: colors.text }}>Total HT: {(ligne.totalLigneHT ?? 0).toFixed(2)} €</Text>
									       <Text style={{ color: colors.text }}>Total TTC: {(ligne.totalLigneTTC ?? 0).toFixed(2)} €</Text>
									       <TouchableOpacity onPress={() => removeLigne(idx)} disabled={lignes.length === 1} style={[styles.removeBtn, { backgroundColor: colors.error }]}> 
										       <Text style={{ color: '#fff' }}>Supprimer</Text>
									       </TouchableOpacity>
								       </View>
							       ))}
							       <TouchableOpacity onPress={addLigne} style={[styles.addBtn, { backgroundColor: colors.primary }]}> 
								       <Text style={{ color: '#fff' }}>Ajouter une ligne</Text>
							       </TouchableOpacity>
							       <Text style={[styles.summary, { color: colors.text }]}>Total HT: {montantHT.toFixed(2)} € | TVA: {montantTVA.toFixed(2)} € | TTC: {montantTTC.toFixed(2)} €</Text>
							       <Text style={[styles.label, { color: colors.text }]}>Conditions</Text>
							       <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={conditions} onChangeText={setConditions} placeholder="Conditions" placeholderTextColor={colors.textSecondary} multiline />
							       <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
							       <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={colors.textSecondary} multiline />
							       {error ? <Text style={{ color: colors.error, marginTop: 10, textAlign: 'center' }}>{error}</Text> : null}
							       <View style={styles.btnRow}>
								       <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: colors.success }]}> 
									       <Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>Créer</Text>
								       </TouchableOpacity>
								       <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.error }]}> 
									       <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Annuler</Text>
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
		borderColor: '#ccc', // Remplacé dynamiquement dans le composant
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginBottom: 10,
		fontSize: 15,
		backgroundColor: '#fff', // Remplacé dynamiquement dans le composant
		width: SCREEN_WIDTH * 0.8,
	},
	sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
	ligneBox: { borderWidth: 1, borderRadius: 10, padding: 8, marginBottom: 8 }, // borderColor dynamique
	addBtn: { padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
	removeBtn: { padding: 8, borderRadius: 8, alignItems: 'center', marginTop: 6 },
	summary: { fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
	submitBtn: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 8 },
	cancelBtn: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
});

