// Modale de création / édition d'une réservation
// - Affiche un formulaire complet (bien, locataire, dates / heures, statut)
// - Utilise un état de formulaire géré par le parent (form, setForm)
// - Fournit un sélecteur de date natif pour les dates d'arrivée et de départ

import React, { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Modal, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

dayjs.locale('fr');

const getContrastTextColor = (hexColor: string) => {
	const sanitized = (hexColor || '').replace('#', '');
	if (sanitized.length !== 6) return '#FFFFFF';

	const r = parseInt(sanitized.slice(0, 2), 16);
	const g = parseInt(sanitized.slice(2, 4), 16);
	const b = parseInt(sanitized.slice(4, 6), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 170 ? '#1E242B' : '#FFFFFF';
};

const isDarkColor = (hexColor: string) => {
	const sanitized = (hexColor || '').replace('#', '');
	if (sanitized.length !== 6) return false;

	const r = parseInt(sanitized.slice(0, 2), 16);
	const g = parseInt(sanitized.slice(2, 4), 16);
	const b = parseInt(sanitized.slice(4, 6), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq < 140;
};

// Structure d'état représentant une réservation complète
type ReservationForm = {
	bienId: string;
	locataireNom: string;
	locatairePrenom: string;
	locataireEmail: string;
	locataireTelephone: string;
	dateArrivee: string;
	dateDepart: string;
	heureArrivee: string;
	heureDepart: string;
	statut: 'confirmée' | 'en attente';
};

// Propriétés attendues par la modale de réservation
interface AddReservationsModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: () => void;
	form: ReservationForm;
	setForm: React.Dispatch<React.SetStateAction<ReservationForm>>;
	biens: any[];
	colors: any;
}

export default function AddReservationsModal({
   visible,
   onClose,
   onSave,
   form,
   setForm,
   biens,
   colors
}: AddReservationsModalProps) {
	const isDarkMode = isDarkColor(colors.background);
	// État local pour savoir quel champ de date on est en train d'éditer
   const [showDatePicker, setShowDatePicker] = useState<{ field: 'dateArrivee' | 'dateDepart' | null, visible: boolean }>({ field: null, visible: false });

	// Helper générique pour mettre à jour un champ du formulaire de réservation
	const updateField = useCallback(
		(key: keyof ReservationForm, value: ReservationForm[keyof ReservationForm]) => {
			setForm(prev => ({ ...prev, [key]: value }));
		},
		[setForm],
	);

	const formatTimeInput = useCallback((value: string) => {
		const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
		if (digitsOnly.length <= 2) return digitsOnly;
		return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
	}, []);

	// Gestion du changement de date (via le DateTimePicker natif)
   const handleDateChange = (event: any, selectedDate?: Date) => {
	   if (event.type === 'dismissed') {
		   setShowDatePicker({ field: null, visible: false });
		   return;
	   }
	   if (selectedDate && showDatePicker.field) {
		   const iso = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD
		   setForm((f: ReservationForm) => ({ ...f, [showDatePicker.field!]: iso }));
	   }
	   setShowDatePicker({ field: null, visible: false });
   };

	// Renvoie une date au format JJ/MM/AAAA pour l'affichage, à partir d'un ISO YYYY-MM-DD
   const getDateValue = (field: 'dateArrivee' | 'dateDepart') => {
	   const val = form[field];
	   if (/^(\d{4})-(\d{2})-(\d{2})$/.test(val) && dayjs(val).isValid()) {
		   return dayjs(val).format('DD/MM/YYYY');
	   }
	   return val || '';
   };
   return (
		<Modal visible={visible} transparent animationType="slide">
			<KeyboardAvoidingView
				style={styles.modalOverlay}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
			>
						<View style={[styles.modalBox, { backgroundColor: colors.surface }]}> 
							<ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
								{/* Titre de la modale */}
								<Text style={[styles.modalTitle, { color: colors.primary }]}>Ajouter une réservation</Text>
								{/* Sélection du bien concerné */}
								<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Bien :</Text>
								<FlatList
									data={biens}
									horizontal
									keyExtractor={b => b.id.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={[styles.chip, form.bienId === item.id.toString() && { backgroundColor: colors.secondary }]}
											onPress={() => updateField('bienId', item.id.toString())}
										>
											<Text style={{ color: form.bienId === item.id.toString() ? '#fff' : colors.text }}>{item.nom}</Text>
										</TouchableOpacity>
									)}
								/>
								{/* Informations sur le locataire */}
								<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Nom du locataire :</Text>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Nom"
									placeholderTextColor={colors.textSecondary}
									value={form.locataireNom}
									onChangeText={v => updateField('locataireNom', v)}
								/>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Prénom"
									placeholderTextColor={colors.textSecondary}
									value={form.locatairePrenom}
									onChangeText={v => updateField('locatairePrenom', v)}
								/>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Email"
									placeholderTextColor={colors.textSecondary}
									value={form.locataireEmail}
									onChangeText={v => updateField('locataireEmail', v)}
									keyboardType="email-address"
									autoCapitalize="none"
								/>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Téléphone"
									placeholderTextColor={colors.textSecondary}
									value={form.locataireTelephone}
									onChangeText={v => updateField('locataireTelephone', v)}
									keyboardType="phone-pad"
								/>
								{/* Bloc date / heure d'arrivée */}
								<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Arrivée :</Text>
								<View style={styles.row}>
								   <TouchableOpacity
									   style={[styles.input, { justifyContent: 'center', backgroundColor: colors.background, borderColor: colors.border }]}
									   onPress={() => setShowDatePicker({ field: 'dateArrivee', visible: true })}
								   >
									   <Text style={{ color: getDateValue('dateArrivee') ? colors.text : colors.textSecondary }}>
										   {getDateValue('dateArrivee') || 'Date (JJ/MM/AAAA)'}
									   </Text>
								   </TouchableOpacity>
								   <TextInput
									   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									   placeholder="Heure (HH:mm)"
									   placeholderTextColor={colors.textSecondary}
									   value={form.heureArrivee}
								   	   onChangeText={v => updateField('heureArrivee', formatTimeInput(v))}
									   keyboardType="number-pad"
								   />
								</View>
							{/* Bloc date / heure de départ */}
								<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Départ :</Text>
								<View style={styles.row}>
								   <TouchableOpacity
									   style={[styles.input, { justifyContent: 'center', backgroundColor: colors.background, borderColor: colors.border }]}
									   onPress={() => setShowDatePicker({ field: 'dateDepart', visible: true })}
								   >
									   <Text style={{ color: getDateValue('dateDepart') ? colors.text : colors.textSecondary }}>
										   {getDateValue('dateDepart') || 'Date (JJ/MM/AAAA)'}
									   </Text>
								   </TouchableOpacity>
								   <TextInput
									   style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									   placeholder="Heure (HH:mm)"
									   placeholderTextColor={colors.textSecondary}
									   value={form.heureDepart}
								   	   onChangeText={v => updateField('heureDepart', formatTimeInput(v))}
									   keyboardType="number-pad"
								   />
								</View>
   {showDatePicker.visible && (
	   <DateTimePicker
		   value={(() => {
			   const val = form[showDatePicker.field!];
			   if (/^(\d{4})-(\d{2})-(\d{2})$/.test(val) && dayjs(val).isValid()) {
				   return new Date(val);
			   }
			   return new Date();
		   })()}
		   mode="date"
		   display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
		   onChange={handleDateChange}
		   locale="fr-FR"
		   themeVariant={isDarkMode ? 'dark' : 'light'}
		   textColor={isDarkMode ? colors.text : '#1E242B'}
		   accentColor={colors.primary}
	   />
   )}
							{/* Choix du statut de la réservation */}
							<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Statut :</Text>
								<View style={styles.row}>
									{(['confirmée', 'en attente'] as const).map(s => (
										<TouchableOpacity
											key={s}
											activeOpacity={0.8}
											style={[
												styles.chip,
												{
													backgroundColor: form.statut === s ? colors.primary : colors.surface,
													borderColor: form.statut === s ? colors.primary : colors.border,
													borderWidth: form.statut === s ? 2 : 1,
												},
											]}
											onPress={() => updateField('statut', s)}
										>
											<Text style={{ color: form.statut === s ? getContrastTextColor(colors.primary) : colors.text, fontWeight: '600' }}>{s}</Text>
										</TouchableOpacity>
									))}
								</View>
							{/* Boutons d'action : sauvegarde / annulation */}
								<View style={styles.modalActions}>
									<TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={onSave}>
										<Text style={{ color: colors.surface, fontWeight: 'bold' }}>Ajouter</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.disabled }]} onPress={onClose}>
										<Text style={{ color: colors.surface }}>Annuler</Text>
									</TouchableOpacity>
								</View>
							</ScrollView>
						</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
	modalBox: { width: '90%', borderRadius: 18, padding: 18 },
	modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
	row: { flexDirection: 'row', gap: 12, marginTop: 10 },
	chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8, marginBottom: 8 },
	input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 15, minWidth: 120 },
	modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 18 },
	modalBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
});
