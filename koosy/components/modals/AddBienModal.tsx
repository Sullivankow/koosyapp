import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { createBien, updateBien, uploadBienImages, geocodeAdresse, getProprietaires } from '../../utils/api';
import { useBienCount } from '../../contexts/BienCountContext';
import type { Proprietaire } from '../../models/proprietaire';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AddBienModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	mode?: 'add' | 'edit';
	bienId?: string;
	initialData?: Partial<any>;
}

const AddBienModal: React.FC<AddBienModalProps> = ({ visible, onClose, onSuccess, mode = 'add', bienId, initialData }) => {
	const { colors } = useTheme();
	const { refreshBiensCount, signalBienAdded } = useBienCount();
	const [form, setForm] = useState({
		nom: '',
		adresse: '',
		type: '',
		superficie: '',
		pieces: '',
		equipements: '',
	});
	const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
	const [selectedProprioId, setSelectedProprioId] = useState<number | undefined>(undefined);
	const [showProprioModal, setShowProprioModal] = useState(false);
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');

	useEffect(() => {
		if (visible) {
			getProprietaires().then(list => {
				setProprietaires(list);
				if (list.length > 0 && !selectedProprioId) setSelectedProprioId(list[0].id);
			}).catch(() => setProprietaires([]));
		}
		if (mode === 'edit' && initialData && visible) {
			setForm({
				nom: initialData.nom || '',
				adresse: initialData.adresse || '',
				type: initialData.type || '',
				superficie: initialData.superficie ? String(initialData.superficie) : '',
				pieces: initialData.pieces ? String(initialData.pieces) : '',
				equipements: Array.isArray(initialData.equipements) ? initialData.equipements.join(', ') : (initialData.equipements || ''),
			});
			if (initialData.proprietaireId) setSelectedProprioId(Number(initialData.proprietaireId));
		}
	}, [mode, initialData, visible]);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: true,
			quality: 1,
		});
		if (!result.canceled && result.assets && result.assets.length > 0) {
			setSelectedImages(prev => [
				...prev,
				...result.assets.map(asset => asset.uri).filter(uri => !!uri)
			]);
		}
	};

	const removeImage = (uri: string) => {
		setSelectedImages(prev => prev.filter(img => img !== uri));
	};

	const handleSubmit = async () => {
		setLoading(true);
		setSuccessMsg('');
		try {
			if (!form.nom.trim() || !form.adresse.trim() || !form.superficie.trim() || !form.pieces.trim()) {
				alert('Veuillez remplir tous les champs obligatoires.');
				setLoading(false);
				return;
			}
			if (selectedProprioId === undefined) {
				alert('Veuillez sélectionner un propriétaire.');
				setLoading(false);
				return;
			}
			const data = {
				nom: form.nom,
				adresse: form.adresse,
				type: form.type,
				superficie: Number(form.superficie),
				pieces: Number(form.pieces),
				equipements: form.equipements ? form.equipements.split(',').map(e => e.trim()) : [],
				proprietaire: selectedProprioId,
			};
			let newBienId = bienId;
			if (mode === 'add') {
				const bienRes = await createBien(data);
				const id = bienRes.id;
				newBienId = String(id);
				if (id) {
					try {
						const coords = await geocodeAdresse(data.adresse);
						if (coords && (coords.lat !== undefined && coords.lng !== undefined)) {
							await updateBien(String(id), { lat: coords.lat, lng: coords.lng });
						}
					} catch (e) {}
				}
				if (id && selectedImages.length > 0) {
					await uploadBienImages(id, selectedImages);
				}
				setSuccessMsg('Bien ajouté avec succès !');
			} else {
				if (!bienId) throw new Error('bienId requis pour l\'édition');
				await updateBien(bienId, data);
				if (selectedImages.length > 0) {
					await uploadBienImages(Number(bienId), selectedImages);
				}
				setSuccessMsg('Bien modifié avec succès !');
			}
			await refreshBiensCount();
			signalBienAdded();
			setTimeout(() => {
				setSuccessMsg('');
				setForm({ nom: '', adresse: '', type: '', superficie: '', pieces: '', equipements: '' });
				setSelectedImages([]);
				setSelectedProprioId(undefined);
				setLoading(false);
				onClose();
				if (onSuccess) onSuccess();
			}, 1200);
		} catch (err) {
			setSuccessMsg(mode === 'add' ? "Erreur lors de l'ajout du bien" : "Erreur lors de la modification du bien");
			setLoading(false);
		}
	};

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlayAdd}>
				<KeyboardAvoidingView behavior="padding" style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
					<View style={[styles.modalContentAdd, { backgroundColor: colors.surface }]}> 
						<ScrollView
							style={{ maxHeight: SCREEN_HEIGHT * 0.6, width: '100%' }}
							contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}
							keyboardShouldPersistTaps="handled"
							horizontal={false}
						>
							<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Ajouter un bien</Text>
							{/* Sélecteur de propriétaire en haut de la modale */}
							<View style={{ width: '100%', marginBottom: 10 }}>
								<Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4, alignSelf: 'flex-start' }}>Propriétaire</Text>
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
												{selectedProprioId !== undefined
													? (() => {
														const proprio = proprietaires.find((p) => p.id === selectedProprioId);
														return proprio ? `${proprio.nom}${proprio.prenom ? ' ' + proprio.prenom : ''}` : 'Sélectionner un propriétaire';
													})()
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
													<ScrollView style={{ maxHeight: 300 }}>
														{proprietaires.map((item) => (
															<TouchableOpacity
																key={item.id}
																style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}
																												onPress={() => {
																													setSelectedProprioId(Number(item.id));
																													setShowProprioModal(false);
																												}}
															>
																<Text style={{ color: colors.text, fontSize: 16 }}>{item.nom}{item.prenom ? ' ' + item.prenom : ''}</Text>
															</TouchableOpacity>
														))}
														<TouchableOpacity onPress={() => setShowProprioModal(false)} style={{ padding: 12, alignItems: 'center' }}><Text style={{ color: colors.error }}>Annuler</Text></TouchableOpacity>
													</ScrollView>
												</View>
											</TouchableOpacity>
										</Modal>
									</>
								) : (
									<Text style={{ color: colors.error, fontWeight: 'bold' }}>Aucun propriétaire trouvé.</Text>
								)}
							</View>
							{/* Champs du bien */}
							<TextInput style={[styles.input, { color: '#111', width: '100%' }]} placeholder="Nom" placeholderTextColor="#888" value={form.nom} onChangeText={v => setForm(f => ({ ...f, nom: v }))} />
							<TextInput style={[styles.input, { color: '#111', width: '100%' }]} placeholder="Adresse" placeholderTextColor="#888" value={form.adresse} onChangeText={v => setForm(f => ({ ...f, adresse: v }))} />
							<TextInput style={[styles.input, { color: '#111', width: '100%' }]} placeholder="Type (Appartement, Maison...)" placeholderTextColor="#888" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
							<TextInput style={[styles.input, { color: '#111', width: '100%' }]} placeholder="Superficie (m²)" placeholderTextColor="#888" value={form.superficie} onChangeText={v => setForm(f => ({ ...f, superficie: v }))} keyboardType="numeric" />
							<TextInput style={[styles.input, { color: '#111', width: '100%' }]} placeholder="Nombre de pièces" placeholderTextColor="#888" value={form.pieces} onChangeText={v => setForm(f => ({ ...f, pieces: v }))} keyboardType="numeric" />
							<TextInput style={[styles.input, { color: '#111', width: '100%' }]} placeholder="Équipements (séparés par des virgules)" placeholderTextColor="#888" value={form.equipements} onChangeText={v => setForm(f => ({ ...f, equipements: v }))} />
							{/* Sélecteur d'images */}
							<TouchableOpacity style={[styles.input, { backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' }]} onPress={pickImage}>
								<Text style={{ color: '#111', fontWeight: 'bold' }}>Ajouter une photo</Text>
							</TouchableOpacity>
							{selectedImages.length > 0 && (
								<ScrollView horizontal style={{ marginVertical: 8 }}>
									{selectedImages.map((uri) => (
										<View key={uri} style={{ marginRight: 10, position: 'relative' }}>
											<Image source={{ uri }} style={{ width: 120, height: 90, borderRadius: 10 }} />
											<TouchableOpacity
												style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}
												onPress={() => removeImage(uri)}
											>
												<Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}>×</Text>
											</TouchableOpacity>
										</View>
									))}
								</ScrollView>
							)}
							{successMsg ? <Text style={{ color: colors.success, marginTop: 10, textAlign: 'center' }}>{successMsg}</Text> : null}
							<TouchableOpacity style={[styles.input, { backgroundColor: colors.primary, marginTop: 18, alignItems: 'center' }]} onPress={handleSubmit} disabled={loading}>
								<Text style={{ color: colors.surface, fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
							</TouchableOpacity>
							<TouchableOpacity style={{ marginTop: 10 }} onPress={onClose}>
								<Text style={{ color: colors.error, textAlign: 'center' }}>Annuler</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
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
		width: '100%',
		maxWidth: 420,
		alignSelf: 'center',
	},
});

export default AddBienModal;

