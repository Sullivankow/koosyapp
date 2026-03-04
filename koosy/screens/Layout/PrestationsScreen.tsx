import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getPrestations, updatePrestationStatut, deletePrestation } from '../../utils/api';
import { Prestation } from '../../models/models';
import AddPrestationModal from '../../components/AddPrestationModal';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const statutColor: Record<string, string> = {
  'confirmée': '#43A047',
  'en attente': '#FF7043',
  'annulée': '#B71C1C',
  'terminée': '#1976D2',
};

const TABS = [
	{ key: 'en attente', label: 'En attente' },
	{ key: 'confirmée', label: 'Confirmée' },
	{ key: 'terminée', label: 'Terminée' },
	{ key: 'annulée', label: 'Annulée' },
];

const PrestationsScreen: React.FC = () => {
	const { refreshPrestationsTerminees } = usePrestationsCount();
	const { colors } = useTheme();
	const [prestations, setPrestations] = useState<Prestation[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [tab, setTab] = useState<'en attente' | 'confirmée' | 'terminée' | 'annulée'>('en attente');

	const fetchPrestations = async () => {
		setLoading(true);
		try {
			const data = await getPrestations();
			setPrestations(data);
		} catch {
			setPrestations([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPrestations();
	}, [modalVisible]);

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 32, marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 }}>
				Mes prestations
			</Text>
			<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 8 }}>
				{TABS.map(tabObj => (
					<TouchableOpacity
						key={tabObj.key}
						style={{
							paddingHorizontal: 8,
							paddingVertical: 4,
							borderRadius: 10,
							marginHorizontal: 3,
							minWidth: 0,
							backgroundColor: tab === tabObj.key ? statutColor[tabObj.key] : colors.surface,
							borderWidth: 1,
							borderColor: tab === tabObj.key ? statutColor[tabObj.key] : colors.border,
						}}
						onPress={() => setTab(tabObj.key as any)}
					>
						<Text style={{ color: tab === tabObj.key ? '#fff' : colors.text, fontWeight: 'bold', fontSize: 12 }}>{tabObj.label}</Text>
					</TouchableOpacity>
				))}
			</View>
			{loading ? (
				<ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
			) : (
				<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
					  <Text style={[styles.title, { color: colors.primary }]}>Prestations {tab}</Text>
					{prestations.filter(p => p.status === TABS.find(t => t.key === tab)?.label).length === 0 ? (
						<Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 24 }}>Aucune prestation {TABS.find(t => t.key === tab)?.label.toLowerCase()}</Text>
					) : (
						prestations.filter(p => p.status === TABS.find(t => t.key === tab)?.label).map((p: Prestation) => (
							<View key={p.id} style={[styles.card, { borderLeftColor: statutColor[p.status] || colors.primary }]}> 
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
									<Text style={styles.cardTitle}>{p.bien?.nom || 'Bien inconnu'}</Text>
									<TouchableOpacity onPress={async () => {
										await deletePrestation(p.id);
										await fetchPrestations();
									}} style={{ marginLeft: 8, padding: 4 }}>
										<MaterialCommunityIcons name="delete" size={22} color={colors.error || '#e53935'} />
									</TouchableOpacity>
								</View>
								<Text style={{ color: '#111', fontWeight: 'bold', fontSize: 16 }}>{p.description || 'Sans description'}</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Montant : {(p.amount_cents / 100).toFixed(2)} €</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Date : {p.date_prestation}</Text>
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Créée le : {p.created_at?.slice(0, 10)}</Text>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}
									>
										{(() => {
											const statusMap: Record<'en attente' | 'confirmée' | 'terminée' | 'annulée', 'En attente' | 'Confirmée' | 'Terminée' | 'Annulée'> = {
												'en attente': 'En attente',
												'confirmée': 'Confirmée',
												'terminée': 'Terminée',
												'annulée': 'Annulée',
											};
											return (['en attente', 'confirmée', 'terminée', 'annulée'] as const).map((s) => {
												const isActive = p.status === statusMap[s];
												return (
													<TouchableOpacity
														key={s}
														  onPress={async () => {
															  if (!isActive) {
																  await updatePrestationStatut(p.id, statusMap[s]);
																  await fetchPrestations();
																  if (refreshPrestationsTerminees) refreshPrestationsTerminees();
															  }
														  }}
														style={{
															backgroundColor: isActive ? statutColor[s] : '#eee',
															opacity: isActive ? 1 : 0.5,
															borderRadius: 12,
															paddingHorizontal: 14,
															paddingVertical: 6,
															marginRight: 8,
															minWidth: 0,
															alignItems: 'center',
															justifyContent: 'center',
															borderWidth: isActive ? 3 : 1,
															borderColor: isActive ? statutColor[s] : '#ccc',
															shadowColor: isActive ? statutColor[s] : 'transparent',
															shadowOpacity: isActive ? 0.3 : 0,
															shadowRadius: isActive ? 6 : 0,
															elevation: isActive ? 4 : 0,
														}}
													>
														<Text style={{ color: isActive ? '#fff' : '#444', fontWeight: 'bold', fontSize: 13 }}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
													</TouchableOpacity>
												);
											});
										})()}
									</ScrollView>
							</View>
						))
					)}
					<AddPrestationModal
						visible={modalVisible}
						onClose={() => setModalVisible(false)}
						onSuccess={fetchPrestations}
					/>
				</ScrollView>
			)}
			<TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
				<MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
			</TouchableOpacity>
		</View>
		);
};

const styles = StyleSheet.create({
	title: { fontSize: 26, fontWeight: 'bold', margin: 18 },
	card: { borderRadius: 16, padding: 16, marginBottom: 18, elevation: 2, backgroundColor: '#fff', borderLeftWidth: 6 },
	cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
	fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});

export default PrestationsScreen;