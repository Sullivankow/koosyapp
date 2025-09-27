import React from 'react';
import { Modal, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Bien } from '../models/models';

const statutColor = {
	'confirmée': '#43A047',
	'en attente': '#FF7043',
	'annulée': '#E53935',
};

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

interface AddReservationsModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: () => void;
	form: ReservationForm;
	setForm: React.Dispatch<React.SetStateAction<ReservationForm>>;
	biens: Bien[];
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
	return (
		<Modal visible={visible} transparent animationType="slide">
			<View style={styles.modalOverlay}>
				<View style={[styles.modalBox, { backgroundColor: colors.surface }]}> 
					<Text style={[styles.modalTitle, { color: colors.primary }]}>Ajouter une réservation</Text>
					<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Bien :</Text>
					<FlatList
						data={biens}
						horizontal
						keyExtractor={b => b.id.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity style={[styles.chip, form.bienId === item.id.toString() && { backgroundColor: colors.secondary }]} onPress={() => setForm((f: ReservationForm) => ({ ...f, bienId: item.id.toString() }))}>
											<Text style={{ color: form.bienId === item.id.toString() ? '#fff' : colors.text }}>{item.nom}</Text>
										</TouchableOpacity>
									)}
					/>
					<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Nom du locataire :</Text>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Nom"
									placeholderTextColor={colors.textSecondary}
									value={form.locataireNom}
									onChangeText={v => setForm((f: ReservationForm) => ({ ...f, locataireNom: v }))}
								/>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Prénom"
									placeholderTextColor={colors.textSecondary}
									value={form.locatairePrenom}
									onChangeText={v => setForm((f: ReservationForm) => ({ ...f, locatairePrenom: v }))}
								/>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Email"
									placeholderTextColor={colors.textSecondary}
									value={form.locataireEmail}
									onChangeText={v => setForm((f: ReservationForm) => ({ ...f, locataireEmail: v }))}
									keyboardType="email-address"
									autoCapitalize="none"
								/>
								<TextInput
									style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
									placeholder="Téléphone"
									placeholderTextColor={colors.textSecondary}
									value={form.locataireTelephone}
									onChangeText={v => setForm((f: ReservationForm) => ({ ...f, locataireTelephone: v }))}
									keyboardType="phone-pad"
								/>
					<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Arrivée :</Text>
					<View style={styles.row}>
									<TextInput
										style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
										placeholder="Date (YYYY-MM-DD)"
										placeholderTextColor={colors.textSecondary}
										value={form.dateArrivee}
										onChangeText={v => setForm((f: ReservationForm) => ({ ...f, dateArrivee: v }))}
									/>
									<TextInput
										style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
										placeholder="Heure (HH:mm)"
										placeholderTextColor={colors.textSecondary}
										value={form.heureArrivee}
										onChangeText={v => setForm((f: ReservationForm) => ({ ...f, heureArrivee: v }))}
									/>
					</View>
					<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Départ :</Text>
					<View style={styles.row}>
									<TextInput
										style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
										placeholder="Date (YYYY-MM-DD)"
										placeholderTextColor={colors.textSecondary}
										value={form.dateDepart}
										onChangeText={v => setForm((f: ReservationForm) => ({ ...f, dateDepart: v }))}
									/>
									<TextInput
										style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
										placeholder="Heure (HH:mm)"
										placeholderTextColor={colors.textSecondary}
										value={form.heureDepart}
										onChangeText={v => setForm((f: ReservationForm) => ({ ...f, heureDepart: v }))}
									/>
					</View>
					<Text style={{ color: colors.textSecondary, marginTop: 8 }}>Statut :</Text>
					<View style={styles.row}>
												{(['confirmée', 'en attente'] as const).map(s => (
													<TouchableOpacity key={s} style={[styles.chip, form.statut === s && { backgroundColor: statutColor[s] }]} onPress={() => setForm((f: ReservationForm) => ({ ...f, statut: s }))}>
														<Text style={{ color: form.statut === s ? '#fff' : colors.text }}>{s}</Text>
													</TouchableOpacity>
												))}
					</View>
					<View style={styles.modalActions}>
						<TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={onSave}>
							<Text style={{ color: colors.surface, fontWeight: 'bold' }}>Ajouter</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.disabled }]} onPress={onClose}>
							<Text style={{ color: colors.surface }}>Annuler</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
	modalBox: { width: '90%', borderRadius: 18, padding: 18 },
	modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
	row: { flexDirection: 'row', gap: 12, marginTop: 10 },
	chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
	input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 15, minWidth: 120 },
	modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 18 },
	modalBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
});
